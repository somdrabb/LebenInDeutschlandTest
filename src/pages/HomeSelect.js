import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TypeAnimation } from 'react-type-animation';
import { IoClose, IoChevronDown, IoArrowUp } from "react-icons/io5";
import { FaClipboardList, FaCheck } from "react-icons/fa";
import { FiLogIn, FiCamera, FiLogOut, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LebenInDeutschland from "../features/quiz/LebenInDeutschland";
import { ContactForm, LanguageSelector, ShareCard } from "../components";

const HomeSelect = ({
  setPhase,
  bundeslaenderWithInfo,
  isLoggedIn,
  setShowLoginModal,
  username,
  language,
  setLanguage,
  handleLogout,
  userProfile
}) => {
  // State management
  const [showShareCard, setShowShareCard] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [activePanel, setActivePanel] = useState("none");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const fileInputRef = useRef();
  const timerRef = useRef(null);
  
  // Avatar options
  const avatarOptions = useMemo(() => [
    "https://i.imgur.com/3WQcX9j.png",  // Player 456
    "https://i.imgur.com/5XvWQ2T.png",  // Player 067
    "https://i.imgur.com/7V9q3ZL.png",  // Player 218
    "https://i.imgur.com/9Yq3ZLX.png",  // The Salesman
    "https://i.imgur.com/2WQcX9j.png",  // Masked Soldier
  ], []);

  // Get auth provider
  const authProvider = userProfile?.providerData?.[0]?.providerId?.replace('.com', '') || 'email';

  // Set initial avatar
  useEffect(() => {
    if (userProfile?.photoURL) {
      setAvatarUrl(userProfile.photoURL);
    } else {
      setAvatarUrl(avatarOptions[0]);
    }
  }, [userProfile, avatarOptions]);

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatarUrl(newAvatarUrl);
      // Here you would typically upload to your backend
    }
  };

  const handleAvatarSelect = (avatar) => {
    setAvatarUrl(avatar);
    setShowUserDropdown(false);
    // Here you would save to user's profile
  };

  // Get current profile picture
  const getProfilePicture = () => {
    // Custom uploaded image
    if (avatarUrl && !avatarOptions.includes(avatarUrl)) {
      return avatarUrl;
    }
    // Provider image (Google, Microsoft etc.)
    if (userProfile?.photoURL && authProvider !== 'password') {
      return userProfile.photoURL;
    }
    // Default avatar
    return avatarUrl;
  };

  // Navigation
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveNav(sectionId);
    }
  }, []);

  // Auto-close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
      if (!e.target.closest(".user-dropdown")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeDropdown !== null) {
      timerRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [activeDropdown]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      const sections = ['about', 'courses', 'resources', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveNav(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Nav items configuration
  const navItems = [
    { id: "about", label: "About" },
    { 
      id: "courses", 
      label: "Courses",
      dropdown: [
        { label: "Leben in Deutschland Test", action: () => {
          setShowIntro(false);
          setActivePanel("LebenInDeutschland");
        }},
        { label: "Einbürgerungstest", action: () => {
          setShowIntro(false);
          setActivePanel("LebenInDeutschland");
        }}
      ]
    },
    { 
      id: "resources", 
      label: "Resources",
      dropdown: [
        { label: "Study Guides", action: () => window.open("/assets/einburgerung.pdf", "_blank") },
        { label: "Checklists", action: () => window.open("/assets/checkliste.pdf", "_blank") }
      ]
    },
    { 
      id: "contact", 
      label: "Contact",
      dropdown: [
        { label: "Contact Form", action: () => setActivePanel("contact") },
        { label: "Support", action: () => setActivePanel("support") }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-dark-blue text-white backdrop-blur-md border-b-2 border-dark-pink shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
    // Reset all application states to home/default
    setPhase?.("home");
    setActivePanel?.("none");
    setShowIntro(true); // Show the intro section again
    setActiveNav("home");
    setShowUserDropdown(false); // Close any open user dropdown
    setActiveDropdown(null); // Close any open navigation dropdowns
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Additional resets if needed
    setShowShareCard(false);
  }}
  className="text-2xl font-extrabold tracking-tight text-black cursor-pointer"
  aria-label="Return to homepage"
>
  LebiDE
</motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative dropdown-container">
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    if (item.dropdown) {
                      setActiveDropdown(activeDropdown === item.id ? null : item.id);
                    } else {
                      scrollToSection(item.id);
                      setActiveNav(item.id);
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    activeNav === item.id
                      ? "bg-blue-900 text-orange-500 shadow-inner"
                      : "text-black hover:text-orange-500 hover:bg-blue-800"
                  }`}
                >
                  <span className="ml-2">{item.label}</span>
                  {item.dropdown && <IoChevronDown className="ml-1 text-sm text-orange-500" />}
                </motion.button>

                {item.dropdown && activeDropdown === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-56 bg-dark-blue text-white rounded-lg shadow-xl border-2 border-dark-pink z-50"
                    onMouseEnter={() => clearTimeout(timerRef.current)}
                    onMouseLeave={() => {
                      timerRef.current = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 1000);
                    }}
                  >
                    <div className="py-1">
                      {item.dropdown.map((dropdownItem, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ x: 5 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dropdownItem.action();
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-900 flex items-center transition-colors"
                        >
                          <span className="ml-2 text-black">{dropdownItem.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector language={language} setLanguage={setLanguage} />

            {!isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-2 bg-orange-500 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all border-2 border-dark-pink"
              >
                <FiLogIn className="text-lg" />
                <span>Einloggen</span>
              </motion.button>
            ) : (
              <div className="relative user-dropdown">
                {/* User Avatar Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-10 h-10 rounded-full bg-white/10 border-2 border-orange-500 shadow-sm hover:ring-2 hover:ring-orange-300 transition-all"
                  aria-label="User profile"
                >
                  <img 
                    src={getProfilePicture()} 
                    alt="User" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = avatarOptions[0];
                    }}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border-2 border-orange-400"
                    >
                      <div className="py-1">
                        {/* User Info */}
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          <p className="font-medium">
                            {userProfile?.displayName || username || "User"}
                          </p>
                          {userProfile?.email && (
                            <p className="text-xs text-gray-500">{userProfile.email}</p>
                          )}
                          <p className="text-xs text-gray-500 capitalize">
                            {authProvider}
                          </p>
                        </div>
                        
                        {/* Avatar Selection - only show for email/password users */}
                        {authProvider === 'password' && (
                          <div className="px-4 py-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              Choose Avatar:
                            </p>
                            <div className="grid grid-cols-4 gap-1">
                              {avatarOptions.slice(0, 4).map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleAvatarSelect(avatar)}
                                  className={`w-8 h-8 rounded-full overflow-hidden hover:ring-2 ring-orange-400 ${
                                    avatarUrl === avatar ? 'ring-2 ring-orange-500' : ''
                                  }`}
                                  aria-label={`Select avatar ${index + 1}`}
                                >
                                  <img 
                                    src={avatar} 
                                    alt={`Avatar ${index}`} 
                                    className="w-full h-full object-cover" 
                                  />
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2 w-full text-xs text-orange-500 hover:text-orange-700 flex items-center justify-center"
                            >
                              <FiCamera className="mr-1" />
                              Upload Photo
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleAvatarChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        )}
                        
                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 flex items-center"
                        >
                          <FiLogOut className="mr-2" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowShareCard(true)}
              className="p-2 text-black hover:text-orange-500 transition-colors"
              aria-label="Share"
            >
              <img src="/assets/shareicon.png" alt="Share" className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </header>
      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-blue rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-dark-pink"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-black">Share</h3>
                <button onClick={() => setShowShareCard(false)} className="p-1 hover:text-red-500">
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              <ShareCard link={window.location.href} onClose={() => setShowShareCard(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {showIntro ? (
          <>
            {/* Modern Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-blue">
              {/* Animated background elements */}
              <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-dark-pink rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-orange-500 rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border-2 border-orange-500"
                >
                  <span className="text-sm font-medium text-black">Willkommen bei LebenInDeutschland</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight"
                >
                  <span>
                    Meistere den
                  </span>
                  <br />
                  <TypeAnimation
                    sequence={[
                      'Einbürgerungstest',
                      1500,
                      'Leben in Deutschland Test',
                      1500,
                      'Staatsbürgerschaftstest',
                      1500
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                    className="block text-orange-500"
                  />
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg md:text-xl text-black mb-10 max-w-2xl mx-auto"
                >
                  Mit unserer intelligenten Lernplattform bereitest du dich effektiv auf die offiziellen Tests vor - 
                  personalisiert, interaktiv und erfolgreich.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row justify-center gap-4"
                >
                  <motion.button
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => {
    setShowIntro(false);
    // Scroll to courses section and activate the first course
    const coursesSection = document.getElementById("courses");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" });
    }
    setActiveNav("courses");
    setTimeout(() => {
      setActivePanel("LebenInDeutschland");
    }, 500); // Small delay to ensure scroll completes
  }}
  className="relative overflow-hidden group bg-orange-500 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-dark-pink"
>
  <span className="relative z-10 flex items-center justify-center gap-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
    Jetzt starten
  </span>
</motion.button>
                  
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection("courses")}
                    className="relative overflow-hidden group bg-white/10 backdrop-blur-md text-black font-bold py-4 px-8 rounded-full border-2 border-dark-pink hover:border-orange-500 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      Kurse entdecken
                    </span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Scroll indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
              >
                <motion.button 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={() => scrollToSection("about")}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border-2 border-orange-500 flex items-center justify-center hover:bg-orange-500 transition-colors"
                >
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </motion.button>
              </motion.div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-dark-blue">
              <div className="max-w-6xl mx-auto px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl font-bold text-black mb-4">Über LebiDE</h2>
                  <p className="text-lg text-black max-w-3xl mx-auto">
                    LebiDE hilft Ihnen, sich optimal auf die offiziellen Tests in Deutschland vorzubereiten.
                  </p>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: (
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      ),
                      title: "Offizielle Fragen",
                      description: "Alle 300 Originalfragen des Bundesamts für Migration und Flüchtlinge (BAMF)",
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                      ),
                      title: "Bundeslandspezifisch",
                      description: "Fragen speziell für Ihr Bundesland mit detaillierten Erklärungen",
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      ),
                      title: "Schnelle Fortschritte",
                      description: "Intelligente Lernsysteme, die Ihren Fortschritt analysieren und optimieren",
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-8 rounded-xl text-center hover:shadow-lg transition-shadow border-2 border-orange-200 via-orange-400 to-orange-500"
                    >
                      <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-600`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-black">{feature.title}</h3>
                      <p className="text-black">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-20 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl font-bold text-black mb-4">Unsere Kurse</h2>
                  <p className="text-lg text-black max-w-3xl mx-auto">
                    Wählen Sie den Kurs, der zu Ihren Bedürfnissen passt
                  </p>
                </motion.div>
                
                <div className="grid md:grid-cols-2 gap-10">
                  {[
                    {
                      icon: <img src="/assets/germany.png" alt="Germany" className="w-12 h-12" />,
                      title: "Leben in Deutschland Test",
                      features: [
                        "Alle 300 Originalfragen",
                        "Bundeslandspezifische Fragen",
                        "Detaillierte Erklärungen"
                      ],
                      action: () => {
                        setShowIntro(false);
                        setActivePanel("LebenInDeutschland");
                      }
                    },
                    {
                      icon: <img src="/assets/einburgerung.jpg" alt="Einbürgerung" className="w-12 h-12 rounded-full" />,
                      title: "Einbürgerungstest",
                      features: [
                        "Offizieller Fragenkatalog",
                        "Prüfungssimulationen",
                        "Lernstatistiken"
                      ],
                      action: () => {
                        setShowIntro(false);
                        setActivePanel("LebenInDeutschland");
                      }
                    }
                  ].map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-pink transition-all"
                    >
                      <div className="p-8">
                        <div className={`flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6 mx-auto  border-2 border-orange-500`}>
                          {course.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-4 text-black">
                          {course.title}
                        </h2>
                        <ul className="text-black mb-6 space-y-2">
                          {course.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <FaCheck className="w-5 h-5 text-orange-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={course.action}
                          className={`w-full bg-orange-500 text-white py-3 rounded-full font-medium flex items-center justify-center space-x-2 hover:shadow-md transition-all border-2 border-dark-pink`}
                        >
                          <FaClipboardList />
                          <span>Kurs starten</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="py-20 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl font-bold text-black mb-4">Kostenlose Ressourcen</h2>
                  <p className="text-lg text-black max-w-3xl mx-auto">
                    Laden Sie unsere kostenlosen Lernmaterialien herunter
                  </p>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      ),
                      title: "Fragenkatalog",
                      description: "Alle offiziellen Fragen als PDF",
                      file: "/assets/fragenkatalog.pdf",
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      ),
                      title: "Checkliste",
                      description: "Alles was Sie für die Einbürgerung brauchen",
                      file: "/assets/checkliste.pdf",
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                        </svg>
                      ),
                      title: "Antragsformulare",
                      description: "Alle notwendigen Formulare",
                      file: "/assets/formulare.pdf",
                    }
                  ].map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="border-2 border-dark-pink rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white"
                    >
                      <div className={`p-6`}>
                        <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 border-2 border-orange-500`}>
                          {resource.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-black">{resource.title}</h3>
                        <p className="text-black mb-4">{resource.description}</p>
                        <a 
                          href={resource.file} 
                          download
                          className={`inline-flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors`}
                        >
                          Herunterladen
                          <FiExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-white-900">
              <div className="max-w-6xl mx-auto px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl font-bold text-black mb-4">Kontaktieren Sie uns</h2>
                  <p className="text-lg text-black max-w-3xl mx-auto">
                    Haben Sie Fragen? Unser Team hilft Ihnen gerne weiter
                  </p>
                </motion.div>
                
                <div className="grid md:grid-cols-2 gap-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold mb-4 text-black">Kontaktinformationen</h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: (
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                          ),
                          label: "Support-Hotline",
                          value: "+49 30 1234567"
                        },
                        {
                          icon: (
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                          ),
                          label: "E-Mail",
                          value: "info@lebide.de"
                        },
                        {
                          icon: (
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          ),
                          label: "Adresse",
                          value: "LebiDE GmbH\nMusterstraße 123\n10115 Berlin"
                        }
                      ].map((contact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <div className="flex-shrink-0 mt-1">{contact.icon}</div>
                          <div className="ml-3">
                            <p className="text-black">{contact.label}</p>
                            <p className="text-black font-medium whitespace-pre-line">{contact.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <ContactForm />
                  </motion.div>
                </div>
              </div>
            </section>
          </>
        ) : activePanel === "LebenInDeutschland" ? (
          <LebenInDeutschland
            setPhase={setPhase}
            bundeslaenderWithInfo={bundeslaenderWithInfo}
            goBack={() => setActivePanel("none")}
            setLanguage={setLanguage}
            language={language}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-12 bg-dark-blue">
            {activePanel === "download" && (
              <div className="mt-16 text-center">
                <h2 className="text-3xl font-bold mb-4 text-black">📥 App herunterladen</h2>
                <div className="flex justify-center space-x-4 mt-6">
                  <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 border-2 border-dark-pink">
                    📱 Google Play
                  </button>
                  <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 border-2 border-dark-pink">
                    🍏 App Store
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg z-50 transition-all border-2 border-dark-pink"
            aria-label="Scroll to top"
          >
            <IoArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HomeSelect;
