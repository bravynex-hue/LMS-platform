// PayPal helper removed; using Razorpay flow only unless explicitly requested
const { getRazorpayInstance } = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const { getIO } = require("../../socket");

// Helper function to enroll student after payment
async function enrollStudentAfterPayment(order) {
  try {
    console.log("📚 Enrolling student after payment:", order.userId, "in course:", order.courseId);
    
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
        console.log("✅ Added course to existing StudentCourses record");
      } else {
        console.log("ℹ️ Course already exists in StudentCourses");
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
      console.log("✅ Created new StudentCourses record");
    }

    // Update course students array
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
          dateOfEnrollment: new Date(),
        },
      },
    });
    console.log("✅ Added student to course.students array");

    // Emit real-time revenue update via Socket.IO
    try {
      const io = getIO();
      io.emit("revenue-update", {
        courseId: order.courseId,
        amount: order.coursePricing,
        studentName: order.userName,
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
      isTestMode, // Add test mode flag
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
              testMode: true
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
