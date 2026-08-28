import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeedback } from '../../features/tracking/trackingAndMiscSlices';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { PageHeader, EmptyState, StatCard } from '../../components/common/CommonComponents';
import RatingStars from '../../components/common/RatingStars';
import ReportChart from '../../components/reports/ReportChart';
import { formatDate } from '../../utils/formatters';

export const FeedbackPage = () => {
  const dispatch = useDispatch();
  const feedbacks = useSelector((state) => state.feedback.items);
  const grievances = useSelector(selectAllGrievances);

  useEffect(() => {
    dispatch(fetchFeedback());
  }, [dispatch]);

  const totalReviews = feedbacks.length;
  const avgRating = totalReviews > 0
    ? (feedbacks.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / totalReviews).toFixed(1)
    : '0';

  const ratingCounts = {
    5: feedbacks.filter((f) => Number(f.rating) === 5).length,
    4: feedbacks.filter((f) => Number(f.rating) === 4).length,
    3: feedbacks.filter((f) => Number(f.rating) === 3).length,
    2: feedbacks.filter((f) => Number(f.rating) === 2).length,
    1: feedbacks.filter((f) => Number(f.rating) === 1).length
  };

  const chartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Ratings Count',
        data: [ratingCounts[5], ratingCounts[4], ratingCounts[3], ratingCounts[2], ratingCounts[1]],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
        borderWidth: 1
      }
    ]
  };

  const getGrievanceInfo = (grievanceId) => {
    return grievances.find((g) => g.id === grievanceId);
  };

  return (
    <div>
      <PageHeader
        title="Citizen Satisfaction & Feedback Analytics"
        subtitle="Review ratings and qualitative feedback submitted by citizens for resolved grievances."
      />

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Average Satisfaction"
            value={`${avgRating} / 5.0`}
            icon="bi-star-fill"
            bgColor="#fffbeb"
            iconColor="#d97706"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Reviews"
            value={totalReviews}
            icon="bi-chat-heart-fill"
            bgColor="#ecfdf5"
            iconColor="#059669"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="5-Star Ratings"
            value={ratingCounts[5]}
            icon="bi-hand-thumbs-up-fill"
            bgColor="#eff6ff"
            iconColor="#2563eb"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="4-Star Ratings"
            value={ratingCounts[4]}
            icon="bi-emoji-smile-fill"
            bgColor="#f0fdf4"
            iconColor="#16a34a"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Rating Breakdown Chart */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-bar-chart-fill me-2 text-warning"></i>
                Star Distribution
              </h5>
            </div>
            <div className="card-body">
              <ReportChart type="bar" data={chartData} height={240} />
            </div>
          </div>
        </div>

        {/* Feedback Reviews List */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-chat-left-quote-fill me-2 text-primary"></i>
                Recent Citizen Reviews
              </h5>
            </div>
            <div className="card-body p-0">
              {feedbacks.length === 0 ? (
                <EmptyState
                  title="No Feedback Submitted"
                  description="No citizen feedback has been recorded yet."
                />
              ) : (
                <div className="list-group list-group-flush">
                  {feedbacks.map((fb) => {
                    const linkedGrv = getGrievanceInfo(fb.grievanceId);

                    return (
                      <div key={fb.id} className="list-group-item p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <RatingStars rating={fb.rating} />
                            <span className="fw-bold small text-warning">{fb.rating} Stars</span>
                          </div>
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {formatDate(fb.createdAt)}
                          </span>
                        </div>

                        {linkedGrv && (
                          <div className="mb-2">
                            <Link to={`/admin/grievances/${linkedGrv.id}`} className="small fw-semibold text-gov-primary text-decoration-none">
                              <span className="badge bg-light text-dark border me-1 font-monospace">{linkedGrv.complaintId}</span>
                              {linkedGrv.title}
                            </Link>
                          </div>
                        )}

                        <p className="small text-secondary mb-0 bg-light p-3 rounded">
                          "{fb.comment}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
