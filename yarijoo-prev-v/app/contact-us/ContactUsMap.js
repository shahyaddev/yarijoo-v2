"use client";

import React, { useRef, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import 'leaflet/dist/leaflet.css'

const ContactUsMap = () => {
  const map = useRef(null);
  const [location, setLoaction] = useState([37.280063, 49.587822]);

  const PointIcon = new L.Icon({
    iconUrl: "/assets/location-icon.png",
    iconRetinaUrl: "/assets/location-icon.png",
    iconAnchor: null,
    // popupAnchor:,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: new L.Point(60, 60),
    className: "",
  });

  return (
    <div className="w-full h-[500px] relative xl:rounded-r-none rounded-xl overflow-hidden">
      <MapContainer
        ref={map}
        center={location}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker icon={PointIcon} position={location}></Marker>
      </MapContainer>
    </div>
  );
};

export default ContactUsMap;
