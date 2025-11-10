import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import PropTypes from "prop-types";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";

function FormControls({ formControls = [], formData, setFormData }) {
  const { toast } = useToast();

  // Date validation handler
  const handleDateChange = (event, fieldName) => {
    const selectedDate = event.target.value;
    
    if (fieldName === "dob" && selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      if (selected > today) {
        toast({
          title: "Invalid Date of Birth",
          description: "Date of birth cannot be in the future. Please select a valid date.",
          variant: "destructive",
        });
        // Don't update the form data with future date
        return;
      }
    }
    
    // Update form data if validation passes
    setFormData({
      ...formData,
      [fieldName]: selectedDate,
    });
  };

  function renderComponentByType(getControlItem) {
    let element = null;
    const currentControlItemValue = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <div className="relative">
            <Input
              id={getControlItem.name}
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              type={getControlItem.type}
              value={currentControlItemValue}
              max={getControlItem.type === "date" && getControlItem.name === "dob" ? new Date().toISOString().split('T')[0] : undefined}
              onChange={(event) => {
                if (getControlItem.type === "date") {
                  handleDateChange(event, getControlItem.name);
                } else {
                  setFormData({
                    ...formData,
                    [getControlItem.name]: event.target.value,
                  });
                }
              }}
              onFocus={() => {
                // Show toast notification for certificate-related fields
                if (getControlItem.name === "userName") {
                  toast({
                    title: (
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-900">Certificate Information</span>
                      </div>
                    ),
                    description: "Username will appear on your course completion certificate",
                    duration: 6000,
                    className: "bg-blue-50 border-2 border-blue-400 shadow-lg [&>div>div]:text-blue-800",
                  });
                } else if (getControlItem.name === "guardianName") {
                  toast({
                    title: (
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-900">Certificate Information</span>
                      </div>
                    ),
                    description: "Guardian name will appear on your course completion certificate",
                    duration: 6000,
                    className: "bg-blue-50 border-2 border-blue-400 shadow-lg [&>div>div]:text-blue-800",
                  });
                }
              }}
            />
          </div>
        );
        break;
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={currentControlItemValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            id={getControlItem.name}
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            value={currentControlItemValue}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      default:
        element = (
          <Input
            id={getControlItem.name}
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            type={getControlItem.type}
            value={currentControlItemValue}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }

    return element;
  }

  return (
    <div className="flex flex-col gap-3">
      {formControls.map((controleItem) => (
        <div key={controleItem.name}>
          <Label htmlFor={controleItem.name}>{controleItem.label}</Label>
          {renderComponentByType(controleItem)}
        </div>
      ))}
    </div>
  );
}

FormControls.propTypes = {
  formControls: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
};

export default FormControls;
