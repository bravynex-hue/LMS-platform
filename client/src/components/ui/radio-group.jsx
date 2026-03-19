import * as React from "react";

const RadioGroupContext = React.createContext({});

const RadioGroup = React.forwardRef(({ value, onValueChange, className = "", children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ value: itemValue, id, className = "", ...props }, ref) => {
  const { value, onValueChange } = React.useContext(RadioGroupContext);
  const isChecked = value === itemValue;

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isChecked}
      onClick={() => onValueChange?.(itemValue)}
      className={`w-4 h-4 rounded-full border-2 ${
        isChecked ? "border-blue-500 bg-blue-500" : "border-gray-300"
      } ${className}`}
      {...props}
    >
      {isChecked && (
        <div className="w-full h-full rounded-full bg-white scale-50" />
      )}
    </button>
  );
});

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

