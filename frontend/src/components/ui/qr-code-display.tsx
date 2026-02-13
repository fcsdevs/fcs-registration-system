"use client";

import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';

export interface QRCodeDisplayProps {
  qrCode: string; // Base64 or URL
  sac?: string; // Simple Attendance Code
  eventName: string;
  participantName: string;
  centerName?: string;
  groupName?: string;
  category?: string; // e.g. "Delegate", "Official"
  fcsCode?: string;
  profilePhotoUrl?: string;
  dates?: string;
  showDownload?: boolean;
  showPrint?: boolean;
}

export function QRCodeDisplay({
  qrCode,
  sac,
  eventName,
  participantName,
  centerName,
  groupName,
  category = "Delegate",
  fcsCode,
  profilePhotoUrl,
  dates,
  showDownload = true,
  showPrint = true,
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const generatePDF = async () => {
    try {
      // Import jspdf dynamically
      const { jsPDF } = await import('jspdf');

      // Load assets
      const [headerBg, fcsLogo, profileImg] = await Promise.all([
        loadImage('/badge-header-nature.png').catch((e) => null),
        loadImage('/fcs_logo.png').catch((e) => null),
        profilePhotoUrl ? loadImage(profilePhotoUrl).catch(() => null) : Promise.resolve(null),
      ]);

      // A6 dimensions: 105mm x 148mm
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6'
      });

      // --- COLORS ---
      const PRIMARY_COLOR = [1, 0, 48]; // #010030
      const ACCENT_COLOR = [31, 122, 99]; // #1F7A63
      const TEXT_COLOR = [60, 60, 60];

      // --- Background ---
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 105, 148, 'F');

      // --- HEADER ---
      const headerHeight = 35; // 35mm

      if (headerBg) {
        doc.addImage(headerBg, 'PNG', 0, 0, 105, headerHeight);
      } else {
        doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.rect(0, 0, 105, headerHeight, 'F');
      }

      // Decorative Line (Bottom of header)
      doc.setDrawColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
      doc.setLineWidth(1.5);
      doc.line(0, headerHeight, 105, headerHeight);

      // --- HEADER CONTENT (Swapped) ---

      // Helper to draw shadow text (simulates stroke/shadow for readability on image)
      const drawShadowText = (text: string | string[], x: number, y: number, options: any, fontSize: number, fontStyle: string = 'bold') => {
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);

        // Shadow (Black, offset)
        doc.setTextColor(0, 0, 0);
        const shadowOffset = 0.4;
        doc.text(text, x + shadowOffset, y + shadowOffset, options);

        // Main Text (White)
        doc.setTextColor(255, 255, 255);
        doc.text(text, x, y, options);
      };

      // LEFT: Logo + Org Name
      if (fcsLogo) {
        const logoSize = 12; // mm
        const logoX = 5;
        const logoY = 4;
        doc.addImage(fcsLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      }

      // Org Name (Left aligned, below logo or wrapped next to it)
      // "FELLOWSHIP OF CHRISTIAN STUDENTS"
      const orgNameLines = doc.splitTextToSize("FELLOWSHIP OF CHRISTIAN STUDENTS", 45);
      drawShadowText(orgNameLines, 5, 20, { align: 'left' }, 9, 'bold'); // Increased size + Shadow

      // RIGHT: Event Title + Date
      const eventNameLines = doc.splitTextToSize(eventName, 55);
      // Event Name needs to be Top Right
      drawShadowText(eventNameLines, 100, 10, { align: 'right' }, 14, 'bold');

      if (dates) {
        // Position dates below event name
        // Calculate Y based on lines
        const dateY = 10 + (Array.isArray(eventNameLines) ? eventNameLines.length * 6 : 6);
        drawShadowText(dates, 100, dateY, { align: 'right' }, 10, 'bold'); // Increased size + Shadow
      }


      // --- VENUE ---
      let yPos = headerHeight + 8;
      if (centerName) {
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text("VENUE / CENTER", 105 / 2, yPos, { align: 'center' });
        yPos += 4;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(centerName, 105 / 2, yPos, { align: 'center' });
        yPos += 8;
      }

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 90, yPos);
      yPos += 6;


      // --- PROFILE SECTION ---
      const avatarX = 15;
      const avatarY = yPos;
      const avatarSize = 30;

      // Avatar Circle Helper
      // Profile Circle
      if (profileImg) {
        doc.saveGraphicsState();
        doc.circle(avatarX + (avatarSize / 2), avatarY + (avatarSize / 2), avatarSize / 2, 'F');
        doc.clip();
        doc.addImage(profileImg, 'JPEG', avatarX, avatarY, avatarSize, avatarSize);
        doc.restoreGraphicsState();
      } else {
        // Simple Silhouette
        doc.setFillColor(200, 200, 210);
        doc.circle(avatarX + (avatarSize / 2), avatarY + (avatarSize / 3), avatarSize / 5, 'F'); // Head
        doc.path([
          { op: 'm', c: [avatarX + 5, avatarY + avatarSize - 2] },
          { op: 'c', c: [avatarX + 5, avatarY + avatarSize / 2, avatarX + avatarSize - 5, avatarY + avatarSize / 2, avatarX + avatarSize - 5, avatarY + avatarSize - 2] },
          { op: 'l', c: [avatarX + 5, avatarY + avatarSize - 2] }
        ], 'F'); // Body
      }

      // Name Text
      const textX = avatarX + avatarSize + 8;
      const textWidth = 105 - textX - 10;

      const nameParts = participantName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' '); // Join remaining parts

      // Surname (Big)
      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);

      const surnameDisplay = lastName || firstName; // Fallback
      const firstnameDisplay = lastName ? firstName : '';

      doc.text(surnameDisplay.toUpperCase(), textX, avatarY + 10, { maxWidth: textWidth });

      // First Name
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(firstnameDisplay, textX, avatarY + 18, { maxWidth: textWidth });

      // Mode String
      doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]); // Green
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`MODE: ${category.toUpperCase()}`, textX, avatarY + 24);

      // FCS Code
      if (fcsCode) {
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(fcsCode, textX, avatarY + 30);
      }


      yPos += avatarSize + 6;

      // --- INFO GRID ---
      // Group
      if (groupName) {
        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(240, 240, 240);
        doc.roundedRect(15, yPos, 75, 12, 2, 2, 'FD');

        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("GROUP ASSIGNMENT", 105 / 2, yPos + 4, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(groupName, 105 / 2, yPos + 9, { align: 'center' });

        yPos += 14;
      } else {
        yPos += 5;
      }

      // --- QR CODE ---
      const qrSize = 35;
      const footerY = 148 - 10;
      const qrY = footerY - qrSize - 10;
      const qrX = (105 - qrSize) / 2;

      if (qrCode) {
        doc.addImage(qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
      }

      if (sac) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
        doc.text(sac, 105 / 2, qrY + qrSize + 5, { align: 'center' });
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.setFont('helvetica', 'italic');
      doc.text("FCS Registration System", 105 / 2, 145, { align: 'center' });

      doc.save(`${participantName.replace(/\s+/g, '_')}_Badge.pdf`);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF badge. Please check your internet connection for image assets.');
    }
  };

  const handleDownload = () => generatePDF();

  const handlePrint = () => {
    // Print logic with HTML
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Badge - ${participantName}</title>
            <style>
              @media print {
                @page { size: A6 portrait; margin: 0; }
                body { margin: 0; -webkit-print-color-adjust: exact; }
              }
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background: #f3f4f6;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
              }
              .badge-container {
                width: 105mm;
                height: 148mm;
                background: white;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
              }
              .header {
                height: 35mm;
                background-image: url('/badge-header-nature.png');
                background-size: cover;
                background-position: center;
                position: relative;
                color: white;
                display: flex;
                justify-content: space-between;
                padding: 15px;
              }
              .header::before {
                 content: '';
                 position: absolute;
                 top: 0; left: 0; right: 0; bottom: 0;
                 background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1));
                 z-index: 0;
              }
              .header-left {
                 z-index: 1;
                 flex: 1;
                 display: flex;
                 flex-direction: column;
                 justify-content: flex-start;
                 align-items: flex-start;
                 text-align: left;
              }
              .logo-img {
                 width: 40px;
                 height: 40px;
                 background: rgba(255,255,255,0.9);
                 border-radius: 50%;
                 padding: 2px;
                 margin-bottom: 6px;
                 box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .org-name {
                 font-size: 8pt;
                 font-weight: 800;
                 text-transform: uppercase;
                 color: white;
                 line-height: 1.2;
                 text-shadow: 0 2px 4px rgba(0,0,0,0.9);
              }
              
              .header-right {
                 z-index: 1;
                 flex: 2;
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 text-align: right;
                 padding-top: 5px;
              }
              .event-name {
                font-size: 16pt;
                font-weight: 800;
                line-height: 1.1;
                text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                margin-bottom: 6px;
              }
              .event-date {
                 font-size: 11pt;
                 font-weight: 700;
                 opacity: 1;
                 text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                 color: #f0f0f0;
              }

              .content {
                flex: 1;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              
              .venue-section {
                 text-align: center;
                 width: 100%;
                 border-bottom: 1px solid #f0f0f0;
                 padding-bottom: 10px;
                 margin-bottom: 15px;
              }
              .label { font-size: 7pt; font-weight: bold; color: #888; letter-spacing: 1px; }
              .value { font-size: 10pt; font-weight: 600; color: #333; }

              .profile-section {
                 display: flex;
                 width: 100%;
                 gap: 15px;
                 align-items: center;
                 margin-bottom: 20px;
                 padding: 0 10px;
              }
              .avatar-circle {
                 width: 80px; height: 80px;
                 background: #f3f4f6;
                 border-radius: 50%;
                 display: flex; justify-content: center; align-items: center;
                 color: #cbd5e1;
              }
              .profile-names { flex: 1; text-align: left; }
              .surname { font-size: 20pt; font-weight: 900; color: #010030; line-height: 1; text-transform: uppercase; }
              .firstname { font-size: 14pt; color: #555; }
              .category { color: #1F7A63; font-weight: bold; font-size: 10pt; margin-top: 4px; text-transform: uppercase; }

              .group-box {
                 background: #f8fafc;
                 width: 90%;
                 text-align: center;
                 padding: 8px;
                 border-radius: 6px;
                 margin-bottom: 10px;
              }
              
              .qr-box { margin-top: auto; text-align: center; margin-bottom: 10px; }
              .qr-img { width: 100px; height: 100px; }
              .sac { font-family: monospace; color: #1F7A63; font-weight: bold; font-size: 12pt; margin-top: 5px; }
              
              .footer { font-size: 7pt; color: #ccc; text-align: center; padding: 5px; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="badge-container">
               <div class="header">
                  <div class="header-left">
                     <img src="/fcs_logo.png" class="logo-img" />
                     <div class="org-name">Fellowship of Christian Students</div>
                  </div>
                  <div class="header-right">
                     <div class="event-name">${eventName}</div>
                     ${dates ? `<div class="event-date">${dates}</div>` : ''}
                  </div>
               </div>
               
               <div class="content">
                  <div class="venue-section">
                     <div class="label">VENUE / CENTER</div>
                     <div class="value">${centerName || 'Main Auditorium'}</div>
                  </div>

                  <div class="profile-section">
                     <div class="avatar-circle">
                         ${profilePhotoUrl ? `<img src="${profilePhotoUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />` : `
                         <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                         `}
                     </div>
                     <div class="profile-names">
                        <div class="surname">${participantName.split(' ').slice(1).join(' ') || participantName.split(' ')[0]}</div>
                        <div class="firstname">${participantName.split(' ').slice(1).join(' ') ? participantName.split(' ')[0] : ''}</div>
                        <div class="category">Mode: ${category}</div>
                        ${fcsCode ? `<div class="fcs-code" style="font-size: 8pt; font-weight: bold; color: #666; font-family: monospace; margin-top:2px;">${fcsCode}</div>` : ''}
                     </div>
                  </div>
                  
                  ${groupName ? `
                  <div class="group-box">
                     <div class="label">GROUP ASSIGNMENT</div>
                     <div class="value">${groupName}</div>
                  </div>` : ''}

                  <div class="qr-box">
                     <img src="${qrCode}" class="qr-img" />
                     ${sac ? `<div class="sac">${sac}</div>` : ''}
                  </div>
               </div>
               
               <div class="footer">FCS Registration System</div>
            </div>
            
            <script>
                window.onload = () => {
                    setTimeout(() => {
                         window.print();
                         window.close();
                    }, 800);
                };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div ref={qrRef} className="bg-white border shadow-xl rounded-xl overflow-hidden max-w-[320px] mx-auto transition-all hover:shadow-2xl">
      {/* PREVIEW CARD */}
      <div
        className="relative h-32 bg-cover bg-center text-white p-4 flex justify-between items-start"
        style={{ backgroundImage: "url('/badge-header-nature.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0"></div>

        {/* Left: Logo + Org */}
        <div className="relative z-10 flex flex-col items-start w-1/3">
          <div className="w-10 h-10 rounded-full bg-white/90 p-1 mb-2 shadow-lg">
            <img src="/fcs_logo.png" alt="FCS" className="w-full h-full object-contain" />
          </div>
          <p className="text-[9px] font-extrabold text-left uppercase leading-tight drop-shadow-md text-white tracking-wide">
            Fellowship of Christian Students
          </p>
        </div>

        {/* Right: Event */}
        <div className="relative z-10 flex-1 text-right pl-2 pt-1">
          <h2 className="text-xl font-extrabold leading-none drop-shadow-lg text-white mb-2">{eventName}</h2>
          {dates && <p className="text-sm font-bold opacity-100 drop-shadow-md text-gray-100">{dates}</p>}
        </div>
      </div>

      <div className="p-4">
        {/* Venue Info */}
        <div className="text-center border-b border-gray-100 pb-3 mb-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Venue / Center</p>
          <p className="text-sm font-semibold text-gray-800">{centerName || 'Main Auditorium'}</p>
        </div>

        {/* Profile Split */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt={participantName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div className="text-left overflow-hidden">
            <h3 className="text-2xl font-black text-[#010030] uppercase leading-none truncate w-full">
              {participantName.split(' ').slice(1).join(' ') || participantName.split(' ')[0]}
            </h3>
            <p className="text-sm font-medium text-gray-500 truncate w-full mb-1">
              {participantName.split(' ').slice(1).join(' ') ? participantName.split(' ')[0] : ''}
            </p>
            <div className="flex flex-col gap-1">
              <span className="inline-block text-[10px] font-bold text-[#1F7A63] uppercase bg-green-50 px-2 py-0.5 rounded border border-green-100 w-fit">
                Mode: {category}
              </span>
              {fcsCode && (
                <span className="text-[10px] font-bold text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                  {fcsCode}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid - Only if Group Name exists */}
        {groupName && (
          <div className="grid grid-cols-1 gap-2 mb-4 bg-gray-50 p-2 rounded-lg text-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase leading-none mb-1">Assigned Group</p>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{groupName}</p>
            </div>
          </div>
        )}

        {/* Footer QR */}
        <div className="text-center">
          <div className="inline-block p-1 border rounded bg-white">
            <img src={qrCode} alt="QR" className="w-24 h-24" />
          </div>
          {sac && (
            <div className="mt-2">
              <p className="font-mono font-bold text-base text-[#1F7A63] bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-200">
                {sac}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center mt-4 pt-4 border-t border-gray-100">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold"
            >
              <Download className="w-3 h-3" />
              PDF
            </button>
          )}
          {showPrint && (
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#010030] text-white rounded-lg hover:opacity-90 text-xs font-semibold"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
