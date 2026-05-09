import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();

// filepath: /Users/justin/repos/photographyWebsite/api/resend.js

const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, email, enquiryType, message } = req.body;

        // Validate required fields
        if (!name || !email || !enquiryType || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Send email using Resend
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `New enquiry from ${name} - ${enquiryType}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Enquiry Type:</strong> ${enquiryType}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Resend error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
}