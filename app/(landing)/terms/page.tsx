import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MyTradeJournal',
  description: 'Terms of Service for MyTradeJournal - Read our terms and conditions for using our trading journal platform.',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Company Information</h2>
        <p>MyTradeJournal is a trading journal application that helps traders record, analyze, and manage their trading activities.</p>
        <p>For inquiries, please contact us at <a href="mailto:anubhavsingh290@gmail.com" className="text-primary hover:underline">anubhavsingh290@gmail.com</a> or visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Services</h2>
        <p>MyTradeJournal provides a platform for traders to record, analyze, and manage their trading activities.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">User Accounts</h2>
        <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Subscription and Payments</h2>
        <p>Subscriptions are billed on a recurring basis. Users can cancel their subscription at any time.</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Storage Clarification</h3>
        <p className="mb-3">Storage limits are defined per subscription tier. Fair use policies apply.</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Lifetime Plan</h3>
        <p>Lifetime plans provide access to the service for the lifetime of the product. The following conditions apply:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Access is granted for the lifetime of the product</li>
          <li>Upgrades and new features are included</li>
          <li>Service may be discontinued under certain conditions</li>
          <li>Refunds are not available for lifetime plans</li>
          <li>Account must remain in good standing</li>
          <li>Terms are subject to change with notice</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
        <p>All content, features, and functionality of the service are owned by MyTradeJournal and are protected by international copyright, trademark, and other intellectual property laws.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Data Protection</h2>
        <p>We are committed to protecting your data. We implement appropriate technical and organizational measures to protect your personal information.</p>
        <p className="mt-2">You have the right to export your data at any time in standard formats.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Liability</h2>
        <p>MyTradeJournal is provided "as is" without warranties of any kind. We are not liable for any losses or damages resulting from use of the service.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Termination</h2>
        <p>We reserve the right to terminate or suspend access to the service immediately, without prior notice, for any breach of these terms.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Service Availability</h2>
        <p>While we strive to maintain high availability, the service may be unavailable under certain circumstances:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Scheduled maintenance</li>
          <li>Unforeseen technical issues</li>
          <li>Force majeure events</li>
        </ul>
        <p className="mt-2">We will provide notice of planned maintenance when possible.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
        <p>These terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
      </section>

      <p className="mt-8 text-sm">Last updated: {new Date().toISOString().split('T')[0]}</p>
    </div>
  );
}
