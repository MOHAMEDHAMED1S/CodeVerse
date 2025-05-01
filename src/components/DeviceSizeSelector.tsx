
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceSizeSelectorProps {
  onChange: (size: { width: string; height: string }) => void;
}

const DeviceSizeSelector = ({ onChange }: DeviceSizeSelectorProps) => {
  const [customWidth, setCustomWidth] = useState("1280");
  const [customHeight, setCustomHeight] = useState("800");

  const deviceSizes = [
    { name: "Mobile", width: "360", height: "640" },
    { name: "Tablet", width: "768", height: "1024" },
    { name: "Desktop", width: "1280", height: "800" },
    { name: "Custom", width: customWidth, height: customHeight },
  ];

  const handleDeviceSelect = (value: string) => {
    const device = deviceSizes.find((d) => d.name.toLowerCase() === value.toLowerCase());
    if (device) {
      onChange({ width: device.width + "px", height: device.height + "px" });
    }
  };

  const handleCustomSizeChange = () => {
    onChange({ width: customWidth + "px", height: customHeight + "px" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select onValueChange={handleDeviceSelect}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Device" />
        </SelectTrigger>
        <SelectContent>
          {deviceSizes.map((device) => (
            <SelectItem key={device.name} value={device.name.toLowerCase()}>
              {device.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center gap-2">
        <Input
          className="w-[70px]"
          type="number"
          value={customWidth}
          onChange={(e) => setCustomWidth(e.target.value)}
          placeholder="Width"
        />
        <span>x</span>
        <Input
          className="w-[70px]"
          type="number"
          value={customHeight}
          onChange={(e) => setCustomHeight(e.target.value)}
          placeholder="Height"
        />
        <Button variant="outline" size="sm" onClick={handleCustomSizeChange}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default DeviceSizeSelector;
