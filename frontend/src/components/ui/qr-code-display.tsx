/**
 * QR Code Display Component
 * Displays QR code and optional SAC for event registration
 */

"use client";

import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
    qrCode: string; // Base64 or URL
    sac?: string; // Simple Attendance Code
    eventName: string;
    participantName: string;
    showDownload?: boolean;
    showPrint?: boolean;
}

export function QRCodeDisplay({
    qrCode,
    sac,
    eventName,
    participantName,
    showDownload = true,
    showPrint = true,
}: QRCodeDisplayProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `${participantName}-${eventName}-QR.png`;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Registration Badge - ${participantName}</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1.6cm; }
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .badge {
                background: white;
                border: 2px solid #010030;
                border-radius: 16px;
                padding: 32px;
                width: 400px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              .header {
                background: #010030;
                color: white;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 24px;
              }
              .event-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              .participant-name {
                font-size: 24px;
                font-weight: bold;
                color: #010030;
                margin: 16px 0;
              }
              .qr-container {
                margin: 24px 0;
              }
              .qr-code {
                max-width: 200px;
                height: auto;
                margin: 0 auto;
              }
              .sac {
                background: #E8F5F1;
                padding: 12px;
                border-radius: 8px;
                margin-top: 16px;
              }
              .sac-label {
                font-size: 12px;
                color: #1F7A63;
                margin-bottom: 4px;
              }
              .sac-code {
                font-size: 28px;
                font-weight: bold;
                color: #1F7A63;
                letter-spacing: 4px;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div class="badge">
              <div class="header">
                <div class="event-name">${eventName}</div>
              </div>
              <div class="participant-name">${participantName}</div>
              <div class="qr-container">
                <img src="${qrCode}" alt="QR Code" class="qr-code"/>
              </div>
              ${sac ? `
                <div class="sac">
                  <div class="sac-label">Simple Attendance Code</div>
                  <div class="sac-code">${sac}</div>
                </div>
              ` : ''}
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    return (
        <div ref={qrRef} className="bg-white border-2 border-[#010030] rounded-lg p-6 text-center">
            <div className="bg-[#010030] text-white p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold">{eventName}</h3>
            </div>

            <p className="text-2xl font-bold text-[#010030] mb-4">{participantName}</p>

            <div className="flex justify-center mb-4">
                <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-200 rounded"
                />
            </div>

            {sac && (
                <div className="bg-[#E8F5F1] p-3 rounded-lg mb-4">
                    <p className="text-xs text-[#1F7A63] mb-1">Simple Attendance Code</p>
                    <p className="text-2xl font-bold text-[#1F7A63] tracking-widest font-mono">{sac}</p>
                </div>
            )}

            <div className="flex gap-2 justify-center mt-4">
                {showDownload && (
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                )}
                {showPrint && (
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[#010030] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Printer className="w-4 h-4" />
                        Print Badge
                    </button>
                )}
            </div>
        </div>
    );
}
