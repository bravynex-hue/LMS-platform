// PayPal helper removed; using Razorpay flow only unless explicitly requested
const { getRazorpayInstance } = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const { getIO } = require("../../socket");

// Helper function to enroll student after payment
async function enrollStudentAfterPayment(order) {
  try {
    // Fetch user details from User model since Order model doesn't store userName/userEmail
    const User = require("../../models/User");
    const user = await User.findById(order.userId).select('userName userEmail studentId guardianDetails');
    
    if (!user) {
      throw new Error(`User not found with ID: ${order.userId}`);
    }
    
    const studentName = user.userName || "";
    const studentEmail = user.userEmail || "";
    
    // Update StudentCourses collection
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      // Check if course already exists to avoid duplicates
      const courseExists = studentCourses.courses.some(c => c.courseId === order.courseId);
      if (!courseExists) {
        studentCourses.courses.push({
          courseId: order.courseId,
          title: order.courseTitle,
          instructorId: order.instructorId,
          instructorName: order.instructorName,
          dateOfPurchase: order.orderDate || new Date(),
          courseImage: order.courseImage,
        });
        await studentCourses.save();
      } else {
        // Course already exists in StudentCourses
      }
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate || new Date(),
            courseImage: order.courseImage,
          },
        ],
      });
      await newStudentCourses.save();
    }

    // Update course students array with fetched user data
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: studentName,
          studentEmail: studentEmail,
          paidAmount: order.coursePricing,
          enrollmentDate: new Date(),
        },
      },
    });

    // Save certificate details to CourseProgress
    const CourseProgress = require("../../models/CourseProgress");
    await CourseProgress.findOneAndUpdate(
      { userId: order.userId, courseId: order.courseId },
      {
        certificateDetails: {
          // 🎯 STICK TO ENROLLMENT FORM DATA ONLY as requested
          fullName: order.certificateFullName || "", 
          guardianName: order.certificateGuardianName || "",
          email: order.certificateEmail || "",
          organization: order.certificateOrganization || "",
          country: order.certificateCountry || "",
        }
      },
      { upsert: true, new: true }
    );

    // Generate roll number (studentId) if it doesn't exist for the user
    // The user requested this happen "once it enroll"
    let userUpdated = false;
    if (!user.studentId) {
      const { generateUniqueStudentId } = require("../../helpers/studentIdGenerator");
      const studentId = await generateUniqueStudentId();
      user.studentId = studentId;
      userUpdated = true;
      console.log("✅ Generated roll number (studentId) during enrollment:", studentId);
    }

    // Update user's guardian name if provided during enrollment and not already set
    if (order.certificateGuardianName && !user.guardianDetails) {
      user.guardianDetails = order.certificateGuardianName;
      userUpdated = true;
      console.log("✅ Updated user's guardian name from enrollment form");
    }

    if (userUpdated) {
      await user.save();
    }

    // Emit real-time revenue update via Socket.IO
    try {
      const io = getIO();
      io.emit("revenue-update", {
        courseId: order.courseId,
        amount: order.coursePricing,
        studentName: studentName,
        instructorId: order.instructorId,
      });
    } catch (socketError) {
      console.warn("Socket.IO emission failed:", socketError.message);
    }

    return true;
  } catch (error) {
    console.error("❌ Error enrolling student:", error);
    throw error;
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
      isTestMode,
      certificateFullName,
      certificateGuardianName,
      certificateEmail,
      certificateOrganization,
      certificateCountry,
    } = req.body;

    // Validate required fields
    if (!userId || !userName || !userEmail || !courseId || !courseTitle || !coursePricing) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, userName, userEmail, courseId, courseTitle, coursePricing"
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // 🚀 NEW: Save certificate details for the specific user IMMEDIATELY upon confirmation
    try {
      const User = require("../../models/User");
      const CourseProgress = require("../../models/CourseProgress");
      
      // Update User profile with guardian details if missing
      if (certificateGuardianName) {
        await User.findByIdAndUpdate(userId, { 
          guardianDetails: certificateGuardianName 
        });
      }

      // Upsert CourseProgress with certificate details so it's ready
      await CourseProgress.findOneAndUpdate(
        { userId, courseId },
        {
          certificateDetails: {
            // 🎯 STICK TO ENROLLMENT FORM DATA ONLY as requested
            fullName: certificateFullName || "",
            guardianName: certificateGuardianName || "",
            email: certificateEmail || "",
            organization: certificateOrganization || "",
            country: certificateCountry || "",
          }
        },
        { upsert: true }
      );
    } catch (saveError) {
      console.error("⚠️ Background save of certificate details failed:", saveError.message);
      // We continue with payment even if this background save fails to avoid blocking the user
    }

    // If Razorpay requested, create INR order
    if (paymentMethod === "razorpay") {
      try {
        const instance = getRazorpayInstance();
        // amount in paise
        const amountInPaise = Math.round(Number(coursePricing) * 100);
        const rzpOrder = await instance.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: { courseId, courseTitle, userEmail },
        });

        const newOrder = new Order({
          userId,
          userName,
          userEmail,
          orderStatus: "pending",
          paymentMethod: "razorpay",
          paymentStatus: "initiated",
          orderDate: orderDate || new Date(),
          paymentId: rzpOrder.id,
          payerId: "",
          instructorId,
          instructorName,
          courseImage,
          courseTitle,
          courseId,
          coursePricing,
          certificateFullName,
          certificateGuardianName,
          certificateEmail,
          certificateOrganization,
          certificateCountry,
        });
        await newOrder.save();

        // Handle test mode - automatically complete the payment
        if (isTestMode) {
          console.log("🧪 Test mode detected - auto-completing payment");
          
          // Update order to paid status
          newOrder.paymentStatus = "paid";
          newOrder.orderStatus = "confirmed";
          newOrder.paymentId = `test_${Date.now()}`;
          newOrder.payerId = `test_payer_${userId}`;
          await newOrder.save();

          // Auto-enroll student
          await enrollStudentAfterPayment(newOrder);

          return res.status(201).json({
            success: true,
            message: "Test payment completed successfully",
            data: {
              orderId: newOrder._id,
              paymentStatus: "paid",
              orderStatus: "confirmed",
              isTestMode: true
            }
          });
        }

        return res.status(201).json({
          success: true,
          data: {
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            orderId: newOrder._id,
            keyId: process.env.RAZORPAY_KEY_ID,
          },
        });
      } catch (e) {
        console.error("Razorpay order creation error:", e);
        if (e.message && e.message.includes("not configured")) {
          return res.status(500).json({ success: false, message: "Payment gateway not configured. Please contact administrator." });
        }
        return res.status(500).json({ success: false, message: "Failed to create payment order. Please try again." });
      }
    }

    // If not Razorpay and no other gateway specified
    return res.status(400).json({ success: false, message: "Unsupported payment method" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;
    if (!order.orderDate) {
      order.orderDate = new Date();
    }

    await order.save();

    // Enroll student using helper function
    await enrollStudentAfterPayment(order);

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePaymentAndFinalizeOrder,
};
