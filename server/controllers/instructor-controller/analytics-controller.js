const Order = require("../../models/Order");
const Course = require("../../models/Course");
const User = require("../../models/User"); // Assuming User model is needed for instructor details

// Helper function to parse amounts
const parseAmount = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.\\-]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

// GET /instructor/analytics/get/:instructorId
const getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;
    console.log("Instructor ID from params:", instructorId);
    if (!instructorId) {
      return res.status(400).json({ success: false, message: "Instructor ID is required" });
    }

    // Fetch instructor courses
    const courses = await Course.find({ instructorId }).lean();
    console.log("Courses found for instructor:", courses.length);

    // Orders for these courses
    const orders = await Order.find({
      instructorId,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    }).lean();

    console.log("Fetched orders:", orders.length);
    orders.forEach(o => {
      console.log(`Order ID: ${o._id}, Payment Status: ${o.paymentStatus}, Order Status: ${o.orderStatus}, Raw coursePricing: ${o.coursePricing}, Parsed: ${parseAmount(o.coursePricing)}`);
    });

    // Totals
    const totalRevenue = orders.reduce((sum, o) => sum + parseAmount(o.coursePricing), 0);
    const totalStudents = courses.reduce((sum, c) => sum + (Array.isArray(c.students) ? c.students.length : 0), 0);
    const avgRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

    console.log("Calculated Totals: Total Revenue =", totalRevenue, "Total Students =", totalStudents);

    // Monthly breakdown last 12 months
    const now = new Date();
    const monthly = [];
    const monthKeyIndex = new Map();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthKeyIndex.set(key, monthly.length);
      monthly.push({ key, label: d.toLocaleString("en-US", { month: "short" }), revenue: 0, students: 0 });
    }
    orders.forEach((o) => {
      const d = new Date(o.orderDate || o.createdAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthKeyIndex.has(key)) {
        const idx = monthKeyIndex.get(key);
        monthly[idx].revenue += parseAmount(o.coursePricing);
        monthly[idx].students += 1;
      }
    });
    console.log("Monthly Data:", monthly);

    // Daily breakdown last 30 days
    const daily = [];
    const dayKeyIndex = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayKeyIndex.set(key, daily.length);
      daily.push({ day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), key, revenue: 0, students: 0 });
    }
    orders.forEach((o) => {
      const d = new Date(o.orderDate || o.createdAt || Date.now());
      const key = d.toISOString().slice(0, 10);
      if (dayKeyIndex.has(key)) {
        const idx = dayKeyIndex.get(key);
        daily[idx].revenue += parseAmount(o.coursePricing);
        daily[idx].students += 1;
      }
    });
    console.log("Daily Data:", daily);

    // Hourly breakdown last 24 hours
    const hourly = [];
    const hourKeyIndex = new Map();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + 'T' + String(d.getHours()).padStart(2,'0');
      hourKeyIndex.set(key, hourly.length);
      hourly.push({ hour: `${String(d.getHours()).padStart(2,'0')}:00`, revenue: 0, students: 0 });
    }
    orders.forEach((o) => {
      const d = new Date(o.orderDate || o.createdAt || Date.now());
      const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + 'T' + String(d.getHours()).padStart(2,'0');
      if (hourKeyIndex.has(key)) {
        const idx = hourKeyIndex.get(key);
        hourly[idx].revenue += parseAmount(o.coursePricing);
        hourly[idx].students += 1;
      }
    });
    console.log("Hourly Data:", hourly);

    // Course performance
    const revenueByCourse = new Map();
    orders.forEach((o) => {
      const key = o.courseId;
      revenueByCourse.set(key, (revenueByCourse.get(key) || 0) + parseAmount(o.coursePricing));
    });
    const coursePerformance = courses
      .map((c) => ({
        id: String(c._id),
        title: c.title || 'Untitled Course',
        students: Array.isArray(c.students) ? c.students.length : 0,
        price: Number(c.pricing || 0),
        revenue: revenueByCourse.get(String(c._id)) || (Number(c.pricing || 0) * (Array.isArray(c.students) ? c.students.length : 0)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category breakdown
    const categoryMap = {};
    courses.forEach((c) => {
      const cat = c.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, students: 0, courses: 0 };
      categoryMap[cat].students += Array.isArray(c.students) ? c.students.length : 0;
      categoryMap[cat].courses += 1;
    });
    coursePerformance.forEach((cp) => {
      const course = courses.find((c) => String(c._id) === cp.id);
      const cat = course?.category || 'General';
      categoryMap[cat].revenue += cp.revenue;
    });
    const categoryData = Object.entries(categoryMap).map(([name, v]) => ({ name, value: v.revenue, students: v.students, courses: v.courses }));

    // Fetch the most recent order for last enrollment
    const lastEnrollmentOrder = await Order.findOne({
      instructorId,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    })
      .sort({ createdAt: -1 }) // Sort by creation date descending to get the latest
      .populate("courseId", "title") // Populate course title
      .populate("userId", "userName userEmail") // Populate user details
      .lean();

    let lastEnrollment = null;
    if (lastEnrollmentOrder) {
      lastEnrollment = {
        studentName: lastEnrollmentOrder.userId?.userName || lastEnrollmentOrder.userName || "Unknown Student",
        courseTitle: lastEnrollmentOrder.courseId?.title || lastEnrollmentOrder.courseTitle || "Unknown Course",
        revenue: parseAmount(lastEnrollmentOrder.coursePricing),
        timestamp: lastEnrollmentOrder.createdAt || lastEnrollmentOrder.orderDate,
      };
    }

    const responseData = {
      totals: {
        totalRevenue,
        totalStudents,
        averageRevenuePerStudent: avgRevenuePerStudent,
        activeCourses: courses.length,
      },
      hourlyData: hourly,
      dailyData: daily,
      monthlyData: monthly.map((m) => ({ month: m.label, revenue: m.revenue, students: m.students })),
      coursePerformance,
      categoryData,
      lastEnrollment,
    };

    console.log("Sending analytics response:", JSON.stringify(responseData, null, 2));

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to load instructor analytics" });
  }
};

module.exports = { getInstructorAnalytics };


