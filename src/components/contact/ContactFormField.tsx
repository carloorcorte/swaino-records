"use client";

import { useId } from "react";

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
}

interface InputProps extends BaseProps {
  as?: "input";
  type?: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

interface TextareaProps extends BaseProps {
  as: "textarea";
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
}

interface SelectProps extends BaseProps {
  as: "select";
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

type ContactFormFieldProps = InputProps | TextareaProps | SelectProps;

export function ContactFormField(props: ContactFormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = !!props.error;

  const fieldStyle = {
    backgroundColor: "var(--surface)",
    border: `1px solid ${hasError ? "#ef4444" : "var(--border)"}`,
    color: "var(--text-primary)",
    borderRadius: "0.5rem",
    padding: "0.625rem 0.875rem",
    width: "100%",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "border-color 0.15s",
  } as React.CSSProperties;

  const sharedProps = {
    id,
    name: props.name,
    "aria-required": props.required,
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? errorId : undefined,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label
        htmlFor={id}
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--text-muted)",
        }}
      >
        {props.label}
        {props.required && (
          <span aria-hidden="true" style={{ color: "#ef4444", marginLeft: "0.25rem" }}>
            *
          </span>
        )}
      </label>

      {props.as === "textarea" ? (
        <textarea
          {...sharedProps}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          rows={props.rows ?? 4}
          maxLength={props.maxLength}
          style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }}
        />
      ) : props.as === "select" ? (
        <select
          {...sharedProps}
          value={props.value}
          onChange={props.onChange}
          style={{ ...fieldStyle, cursor: "pointer" }}
        >
          {props.children}
        </select>
      ) : (
        <input
          {...sharedProps}
          type={props.type ?? "text"}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          autoComplete={props.autoComplete}
          style={fieldStyle}
        />
      )}

      {hasError && (
        <p
          id={errorId}
          role="alert"
          style={{ fontSize: "0.8125rem", color: "#ef4444", margin: 0 }}
        >
          {props.error}
        </p>
      )}
    </div>
  );
}
