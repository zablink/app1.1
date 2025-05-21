// src/components/Map.tsx
import React from "react";
import { Location } from "@/types/location";

type MapProps = Location & {
  onChange: (lat: number, lng: number) => void;
};

const Map: React.FC<MapProps> = ({ lat, lng, onChange }) => {
  return <div>Map Placeholder</div>;

};

export default Map;