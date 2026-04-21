import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE } from "../context/ShopContext";
import { useModal } from "../context/ModalContext";
import "./CSS/TrackOrder.css";

// Fix default Leaflet marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const warehouseIcon = new L.DivIcon({
    className: "custom-leaflet-icon warehouse-icon",
    html: `<div style="
        background: linear-gradient(135deg, #1e293b, #334155);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.3);
    ">W</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const destinationIcon = new L.DivIcon({
    className: "custom-leaflet-icon destination-icon",
    html: `<div style="
        background: linear-gradient(135deg, #ff4141, #ef4444);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(255,65,65,0.4);
    ">D</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const truckIcon = new L.DivIcon({
    className: "custom-leaflet-icon truck-marker-icon",
    html: `<div style="
        font-size: 28px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        animation: truckBounce 2s ease-in-out infinite;
    ">🚚</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Component to fit map bounds to route
const FitBounds = ({ origin, destination }) => {
    const map = useMap();
    useEffect(() => {
        if (origin && destination) {
            const bounds = L.latLngBounds(
                [origin.lat, origin.lng],
                [destination.lat, destination.lng]
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, origin, destination]);
    return null;
};

const TrackOrder = () => {
    const { orderId } = useParams();
    const { showModal } = useModal();
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/orders/track/${orderId}`, {
                    headers: { "auth-token": localStorage.getItem("auth-token") },
                });
                if (response.data.success) {
                    setTrackingInfo(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch tracking data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracking();
        const interval = setInterval(fetchTracking, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return <div className="track-order-loading">
        <div className="spinner"></div>
        <p>Fetching real-time tracking data...</p>
    </div>;

    if (!trackingInfo) return <div className="track-order-error">No tracking information found.</div>;

    const { milestones, status, currentLocation, routePoints, origin, destination, address, amount, estimatedArrival } = trackingInfo;

    // Convert {lat, lng} to [lat, lng] for Leaflet
    const originPos = [origin.lat, origin.lng];
    const destPos = [destination.lat, destination.lng];
    const currentPos = currentLocation ? [currentLocation.lat, currentLocation.lng] : null;
    const routePath = routePoints.map(p => [p.lat, p.lng]);

    return (
        <div className="track-order-page">
            <div className="track-order-header-main">
                <div className="header-content">
                    <h1>Order Tracking</h1>
                    <p>Order ID: <span>#{orderId.slice(-8).toUpperCase()}</span></p>
                </div>
                <div className="eta-badge">
                    <p>Estimated Arrival</p>
                    <h3>{estimatedArrival ? estimatedArrival.split(',')[0] : "Calculating..."}</h3>
                </div>
            </div>

            <div className="track-order-grid">
                <div className="track-order-main">
                    <div className="map-wrapper">
                        <MapContainer
                            center={currentPos || originPos}
                            zoom={12}
                            scrollWheelZoom={true}
                            style={{ width: '100%', height: '400px', borderRadius: '15px' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <FitBounds origin={origin} destination={destination} />

                            {/* Warehouse Marker */}
                            <Marker position={originPos} icon={warehouseIcon}>
                                <Popup>
                                    <strong>📦 Warehouse</strong><br />
                                    Origin Point
                                </Popup>
                            </Marker>

                            {/* Destination Marker */}
                            <Marker position={destPos} icon={destinationIcon}>
                                <Popup>
                                    <strong>📍 Delivery Address</strong><br />
                                    {address.street}, {address.city}
                                </Popup>
                            </Marker>

                            {/* Truck / Current Location Marker */}
                            {currentPos && (
                                <Marker position={currentPos} icon={truckIcon}>
                                    <Popup>
                                        <strong>🚚 Driver Location</strong><br />
                                        Status: {status}
                                    </Popup>
                                </Marker>
                            )}

                            {/* Route Polyline */}
                            <Polyline
                                positions={routePath}
                                pathOptions={{
                                    color: "#ff4141",
                                    weight: 4,
                                    opacity: 0.8,
                                    dashArray: "10, 6",
                                }}
                            />
                        </MapContainer>
                    </div>

                    <div className="timeline-card">
                        <h3>Delivery Journey</h3>
                        <div className="custom-timeline">
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`custom-timeline-item ${milestone.completed ? "active" : ""}`}>
                                    <div className="timeline-dot">
                                        <div className="dot-inner"></div>
                                    </div>
                                    <div className="timeline-info">
                                        <div className="info-header">
                                            <h4>{milestone.status}</h4>
                                            {milestone.completed && milestone.time && (
                                                <span className="time">
                                                    {milestone.time.includes(',') ? milestone.time.split(',')[1] : milestone.time}
                                                </span>
                                            )}
                                        </div>
                                        <p>{milestone.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="track-order-sidebar">
                    <div className="status-card">
                        <p>Current Status</p>
                        <h2 className={`status-text ${status.toLowerCase().replace(/ /g, '-')}`}>{status}</h2>
                    </div>

                    <div className="delivery-details-card">
                        <h3>Shipping Details</h3>
                        <div className="detail-item">
                            <label>Recipient</label>
                            <p>{address.firstName} {address.lastName}</p>
                        </div>
                        <div className="detail-item">
                            <label>Phone</label>
                            <p>{address.phone || "Not provided"}</p>
                        </div>
                        <div className="detail-item">
                            <label>Address</label>
                            <p>{address.street}, {address.city}</p>
                            <p>{address.state}, {address.zipcode}</p>
                        </div>
                    </div>

                    <div className="order-total-card">
                        <div className="total-row">
                            <span>Order Total</span>
                            <span className="amount">₹{amount}.00</span>
                        </div>
                        <p className="payment-method">Paid via {trackingInfo.paymentMethod || "Razorpay"}</p>
                    </div>

                    <button className="support-button" onClick={() => showModal({ title: 'Support', message: "Connecting to support..." })}>
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
