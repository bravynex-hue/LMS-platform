// PayPal helper removed; using Razorpay flow only unless explicitly requested
const { getRazorpayInstance } = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");


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

    //update out student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
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

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });



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

module.exports = { createOrder, capturePaymentAndFinalizeOrder };
