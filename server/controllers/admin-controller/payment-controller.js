const Order = require("../../models/Order");
const User = require("../../models/User");

// Get all transactions (admin only) - combines course orders and internship enrollments
const getAllTransactions = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Get all transactions - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all course orders
    const orders = await Order.find({})
      .populate("userId", "userName userEmail")
      .populate("courseId", "title")
      .sort({ orderDate: -1, createdAt: -1 })
      .lean();

    // Transform orders into transaction format
    const courseTransactions = orders.map((order) => {
      const studentName = order.userId?.userName || order.userName || "Unknown";
      const studentEmail = order.userId?.userEmail || order.userEmail || "";
      const itemName = order.courseTitle || order.courseId?.title || "Unknown Course";
      
      // Map payment status to transaction status
      let status = "pending";
      if (order.paymentStatus === "paid" || order.paymentStatus === "completed") {
        status = "completed";
      } else if (order.paymentStatus === "failed" || order.paymentStatus === "cancelled") {
        status = "failed";
      }

      return {
        _id: order._id,
        studentName,
        studentEmail,
        type: "course",
        itemName,
        amount: order.coursePricing || 0,
        status,
        date: order.orderDate || order.createdAt || new Date(),
        paymentMethod: order.paymentMethod || "unknown",
        paymentId: order.paymentId || null,
        orderId: order._id,
        courseId: order.courseId?._id || order.courseId,
      };
    });

    // (internship transactions removed – internships feature deprecated)

    // Combine and sort all transactions
    const allTransactions = courseTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Calculate summary statistics
    const totalRevenue = allTransactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalTransactions = allTransactions.length;
    const completedTransactions = allTransactions.filter((t) => t.status === "completed").length;

    return res.status(200).json({
      success: true,
      data: allTransactions,
      summary: {
        totalRevenue,
        totalTransactions,
        completedTransactions,
        pendingTransactions: allTransactions.filter((t) => t.status === "pending").length,
        failedTransactions: allTransactions.filter((t) => t.status === "failed").length,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

// Export transactions report (admin only)
const exportTransactionsReport = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Export transactions - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all transactions (same logic as getAllTransactions)
    const orders = await Order.find({})
      .populate("userId", "userName userEmail")
      .populate("courseId", "title")
      .sort({ orderDate: -1, createdAt: -1 })
      .lean();


    const courseTransactions = orders.map((order) => {
      const studentName = order.userId?.userName || order.userName || "Unknown";
      const studentEmail = order.userId?.userEmail || order.userEmail || "";
      const itemName = order.courseTitle || order.courseId?.title || "Unknown Course";
      
      let status = "pending";
      if (order.paymentStatus === "paid" || order.paymentStatus === "completed") {
        status = "completed";
      } else if (order.paymentStatus === "failed" || order.paymentStatus === "cancelled") {
        status = "failed";
      }

      return {
        studentName,
        studentEmail,
        type: "course",
        itemName,
        amount: order.coursePricing || 0,
        status,
        date: order.orderDate || order.createdAt || new Date(),
        paymentMethod: order.paymentMethod || "unknown",
      };
    });

    // Since internships feature removed, only course transactions remain
    const allTransactions = courseTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Return CSV-ready data
    return res.status(200).json({
      success: true,
      data: allTransactions,
      format: "csv",
      filename: `transactions-report-${new Date().toISOString().split("T")[0]}.csv`,
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Error exporting transactions",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  exportTransactionsReport,
};

