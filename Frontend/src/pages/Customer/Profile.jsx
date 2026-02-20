import React, { useState, useEffect } from "react";
import userService from "../../services/user.service";
import AuthService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check if user is authenticated
    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);

        if (!currentUser?.id || !currentUser?.token) {
            setMessage("Please log in to view your profile");
            return;
        }

        // Check if token is expired
        try {
            const tokenPayload = JSON.parse(atob(currentUser.token.split('.')[1]));
            if (tokenPayload.exp < Date.now() / 1000) {
                setMessage("Your session has expired. Please log in again.");
                setTimeout(() => {
                    localStorage.removeItem('user');
                    navigate("/login");
                }, 1000);
                return;
            }
            fetchUserProfile();
        } catch (error) {
            setMessage("Invalid session. Please log in again.");
            setTimeout(() => navigate("/login"), 1000);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const res = await userService.getCurrentUser();
            setUserData(res.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
            if (err.response?.status === 403) {
                setMessage("Your session has expired. Please log in again.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage("Failed to load profile");
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if user is authenticated before showing content
    if (!user) {
        return (
            <div className="container py-5">
                <div className="admin-card p-5 text-center shadow-sm">
                    <h2 className="text-danger fw-bold mb-3">Authentication Required</h2>
                    <p className="text-secondary mb-4">Please log in to view your profile.</p>
                    <button
                        className="btn-primary-tech px-4 py-2"
                        onClick={() => navigate("/login")}
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">My Profile</h2>
            {message && <div className="alert alert-info">{message}</div>}

            {userData ? (
                <div className="admin-card p-4 shadow-sm">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Username</label>
                            <p className="form-control-static">{userData.username}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <p className="form-control-static">{userData.email}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">First Name</label>
                            <p className="form-control-static">{userData.firstName || 'Not provided'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Last Name</label>
                            <p className="form-control-static">{userData.lastName || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Phone Number</label>
                            <p className="form-control-static">{userData.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Account Status</label>
                            <p className="form-control-static">
                                <span className={`badge ${userData.status ? 'bg-success' : 'bg-danger'}`}>
                                    {userData.status ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Registration Date</label>
                            <p className="form-control-static">
                                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Roles</label>
                            <p className="form-control-static">
                                {userData.roles?.map(role => (
                                    <span key={role} className="badge bg-primary me-1">
                                        {role.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="admin-card p-5 text-center shadow-sm">
                    <h4 className="text-secondary mb-3">Profile Not Available</h4>
                    <p className="text-muted">Unable to load your profile information.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
