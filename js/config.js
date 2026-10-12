/* =========================================================================
   15 NOVEMBER INVITATION - CONTENT CONFIG
   -------------------------------------------------------------------------
   Edit the text in this ONE file to change what the card shows. Save and
   refresh the browser to see changes.

   - eventDate drives the countdown, so keep its exact format
     "YYYY-MM-DDTHH:MM:SS+05:30" (24-hour clock, Indian time).
   - Everything else is plain display text.
   ========================================================================= */

window.CARD_CONFIG = {

  // ---- Couple --------------------------------------------------------
  couple: {
    groom: "Shyam",
    bride: "Saloni"
  },

  // ---- Families (shown under each name on the invitation) -------------
  families: {
    brideParents: "Mrs. Ritu Gupta & Mr. Shri Mohan Varshney",
    brideGrandparents: "Late Smt. Anara Devi & Late Shri Jagdish Prasad Gupta",
    groomParents: "Mrs. Rekha Rani & Er. Sanjeev Kumar Varshney",
    groomGrandparents: "Late Smt. Laxmi Devi & Late Shri Ram Krishna Varshney (BDO)",
    signOff: "All Varshney Family",
    signOffNote: "(Maida Wala Pariwar)"
  },

  // ---- Invitation wording -------------------------------------------
  shloka: [
    "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।",
    "निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
  ],
  inviteLine1: "Two hearts, two souls, bound together in love forever.",
  inviteLine2: "With the Blessings Of The Almighty, We Solicit Your Gracious Presence With Family & Friends On The Auspicious Occasion Of The",
  occasion: "Pre-Wedding Reception and Sangeet of",

  // ---- Date ------------------------------------------------------------
  // eventDate MUST keep this exact format - it drives the countdown.
  eventDate: "2026-11-15T00:00:00+05:30",
  saveTheDate: { day: "15", month: "NOV", year: "2026" },
  saveTheDateLine: "For the Pre-Wedding Reception and Sangeet",
  dateDisplay: "Sunday, 15th November 2026",

  // ---- Our Beautiful Moments (photos change by themselves) ------------
  galleryInterval: 1500,   // milliseconds per photo
  gallery: [
    { img: "assets/images/gallery/photo-3.jpg" },   // tilak
    { img: "assets/images/gallery/photo-4.jpg" },   // Taj Mahal
    { img: "assets/images/gallery/photo-1.jpg" },   // sitting on the sofa
    { img: "assets/images/gallery/photo-2.jpg" }    // red dress
  ],

  // ---- Venue -----------------------------------------------------------
  venue: {
    intro: "Under the sky, surrounded by those we love most, we would be honoured to celebrate with you.",
    name: "Agarwal Seva Sadan",
    address: "Agra Road, Kalwari, Hathras, Uttar Pradesh – 204101",
    directionsUrl: "https://www.google.com/maps/place/H373%2B36G+Agarwal+Seva+Sadan,+Agra+Rd,+Hathras,+Kalwari,+Uttar+Pradesh+204101/@27.5626068,78.0504486,17z/data=!3m1!4b1!4m6!3m5!1s0x397484ef70afffff:0x863c0032a7ab120a!8m2!3d27.5626068!4d78.0530235!16s%2Fg%2F11z8r3kqb_!5m1!1e1"
  },

  // ---- Closing note ---------------------------------------------------
  closing: {
    message: "We can't wait to celebrate with you. Your presence will make our day all the more special.",
    tagline: "Two families, one beautiful beginning — see you there"
  },

  // ---- R.S.V.P. (shown after the closing message) ----------------------
  rsvp: {
    title: "R.S.V.P.",
    names: [
      "Mr. Ram Kishan Varshney & Mrs. Amita Varshney",
      "Mr. Radhey Shyam Varshney & Mrs. Kusum Lata"
    ]
  },

  // ---- Background music ----------------------------------------------
  audio: { src: "assets/audio/music.mp3" }
};
