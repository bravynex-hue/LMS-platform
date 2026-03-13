const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

// GET /student/analytics/:userId
const getStudentAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Fetch paid/confirmed orders for this student
    const orders = await Order.find({
      userId,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    }).lean();

    // Sum totals
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.coursePricing || 0), 0);
    const totalPurchases = orders.length;

    // Fetch courses owned (for counts and last purchases)
    const owned = await StudentCourses.findOne({ userId }).lean();
    const ownedCourses = owned?.courses || [];

    // Monthly breakdown (last 12 months)
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleString("en-US", { month: "short" }), revenue: 0, purchases: 0 });
    }
    const monthIndexByKey = new Map(months.map((m, idx) => [m.key, idx]));
    orders.forEach((o) => {
      const d = new Date(o.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthIndexByKey.has(key)) {
        const idx = monthIndexByKey.get(key);
        months[idx].revenue += Number(o.coursePricing || 0);
        months[idx].purchases += 1;
      }
    });

    // Category breakdown by joining with Course
    const courseIds = [...new Set(orders.map((o) => o.courseId).filter(Boolean))];
    const courses = courseIds.length > 0 ? await Course.find({ _id: { $in: courseIds } }).lean() : [];
    const idToCategory = new Map(courses.map((c) => [String(c._id), c.category || "General"]));
    const categoryMap = {};
    orders.forEach((o) => {
      const cat = idToCategory.get(o.courseId) || "General";
      if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, purchases: 0 };
      categoryMap[cat].revenue += Number(o.coursePricing || 0);
      categoryMap[cat].purchases += 1;
    });

    // Recent activity from owned courses
    const recentActivity = ownedCourses
      .slice()
      .sort((a, b) => new Date(b.dateOfPurchase || 0) - new Date(a.dateOfPurchase || 0))
      .slice(0, 20) // cap
      .map((c) => ({
        courseId: c.courseId,
        courseTitle: c.title,
        instructorId: c.instructorId,
        instructorName: c.instructorName,
        date: c.dateOfPurchase,
      }));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          totalSpent,
          totalPurchases,
          totalOwnedCourses: ownedCourses.length,
        },
        monthly: months,
        categories: categoryMap,
        recentActivity,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
};

module.exports = { getStudentAnalytics };


