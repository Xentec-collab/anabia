"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent. We'll get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        subject: "General inquiry",
        message: "",
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full bg-[var(--bg)] min-h-screen">
      <div className="w-full h-[200px] flex flex-col items-center justify-center pt-10">
        <h1 className="font-serif text-[36px] md:text-[40px] text-[var(--ink)] mb-6">
          Get in Touch
        </h1>
        <div className="w-12 h-[1px] bg-[var(--line)]" />
      </div>

      <div className="max-w-xl mx-auto px-6 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="h-12 bg-[var(--surface)] border border-[var(--line)] px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-12 bg-[var(--surface)] border border-[var(--line)] px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="subject" className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="h-12 bg-[var(--surface)] border border-[var(--line)] px-4 text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none appearance-none"
            >
              <option value="General inquiry">General inquiry</option>
              <option value="Wholesale inquiry">Wholesale inquiry</option>
              <option value="Stockist inquiry">Stockist inquiry</option>
              <option value="Press">Press</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="message" className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="bg-[var(--surface)] border border-[var(--line)] px-4 py-3 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none resize-y"
              placeholder="How can we help you?"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[48px] bg-[var(--ink)] text-[var(--surface)] text-[14px] rounded-none hover:bg-[var(--accent)] transition-colors mt-2 disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
