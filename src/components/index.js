import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo
} from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { getWrongAnswerIds } from "../utils/wrongAnswers";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaQuestionCircle,
  FaHeadset,
  FaCommentAlt,
  FaTrashAlt,
  FaFileAlt,
  FaShieldAlt,
  FaCookieBite,
  FaBalanceScale,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHome,
  FaGraduationCap,
  FaGlobeEurope,
  FaHandsHelping,
  FaBriefcase,
  FaBook,
  FaMapMarkerAlt,
  FaClock,
  FaLanguage
} from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import { FiX, FiCopy } from "react-icons/fi";

function AuthForm({
  handleAuth,
  handleGoogleLogin,
  handleFacebookLogin,
  setAuthMode,
  formData = {},
  setFormData,
  showPassword,
  showRepeatPassword,
  handleMicrosoftLogin,
  handleGithubLogin,
  handleAnonymousLogin
}) {
  const [step, setStep] = useState("choose");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const updateField = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const passwordLength = formData.password?.length || 0;
  const passwordStatus = passwordLength >= 8 ? "green" : passwordLength >= 4 ? "yellow" : "red";
  const passwordMatch = formData.password === formData.repeatPassword;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/80 backdrop-blur-sm px-4 py-12">
      <div className="w-[95%] sm:w-[90%] md:w-[400px] lg:w-[420px] xl:w-[450px] bg-white p-8 rounded-xl shadow-lg border-2 border-orange-200 relative">
        {step === "choose" && (
          <>
            <div className="space-y-4">
              <button
                onClick={() => {
                  handleGoogleLogin();
                  setStep("form");
                }}
                className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 text-gray-800 py-3 rounded-lg font-semibold border-2 border-orange-400 transition-all"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign Up with Google
              </button>

              <button
                onClick={() => {
                  handleMicrosoftLogin();
                  setStep("form");
                }}
                className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 text-gray-800 py-3 rounded-lg font-semibold border-2 border-orange-400 transition-all"
              >
                <img src="/assets/microsoft.png" alt="Microsoft" className="w-5 h-5" />
                Sign Up with Microsoft
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <div className="h-px bg-gray-300 flex-grow"></div>
                OR
                <div className="h-px bg-gray-300 flex-grow"></div>
              </div>
              <button
                onClick={() => setStep("form")}
                className="w-full bg-blue-100 hover:bg-blue-200 text-gray-800 py-3 rounded-lg font-semibold border-2 border-orange-400 transition-all"
              >
                Sign Up with an email
              </button>

              <p className="text-center text-xs text-gray-500 mt-2 font-medium">
                IT'S FREE!
              </p>
              <button
                onClick={() => setShowLoginForm((prev) => !prev)}
                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showLoginForm ? "einloggen" : "Login with email"}
              </button>
              {showLoginForm && (
                <form onSubmit={handleAuth} className="space-y-4 pt-4">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={updateField}
                    className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password || ""}
                    onChange={updateField}
                    className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-100 hover:bg-blue-200 text-gray-800 font-bold py-2 rounded-lg border-2 border-orange-400 transition-all"
                  >
                    Login
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {step === "form" && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2 text-orange-600">Sign Up Now</h1>
            <p className="text-center text-sm text-gray-600 mb-6">
              Instant access to learning content and quiz history—just sign in
            </p>

            <div className="grid grid-cols-5 gap-2 mb-6 text-center text-xs font-medium text-gray-700">
              <div
                onClick={handleGoogleLogin}
                className="border-2 border-orange-200 rounded-lg p-3 hover:bg-blue-50 flex flex-col items-center cursor-pointer transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 mb-1" />
                Google
              </div>

              <div
                onClick={handleMicrosoftLogin}
                className="border-2 border-orange-200 rounded-lg p-3 hover:bg-blue-50 flex flex-col items-center cursor-pointer transition-colors"
              >
                <img src="/assets/microsoft.png" alt="Microsoft" className="w-6 h-6 mb-1" />
                Microsoft
              </div>

              <div
                onClick={handleFacebookLogin}
                className="border-2 border-orange-200 rounded-lg p-3 hover:bg-blue-50 flex flex-col items-center cursor-pointer transition-colors"
              >
                <img src="/assets/facebook.png" alt="Facebook" className="w-6 h-6 mb-1" />
                Facebook
              </div>

              <div
                onClick={handleGithubLogin}
                className="border-2 border-orange-200 rounded-lg p-3 hover:bg-blue-50 flex flex-col items-center cursor-pointer transition-colors"
              >
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="w-6 h-6 mb-1" />
                GitHub
              </div>
              <div
                onClick={handleAnonymousLogin}
                className="border-2 border-orange-200 rounded-lg p-3 hover:bg-blue-50 flex flex-col items-center cursor-pointer transition-colors"
              >
                <img src="/assets/anonymous.png" alt="Anon" className="w-5 h-5" />
                as Guest
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
              <div className="h-px bg-gray-300 flex-grow"></div>
              OR
              <div className="h-px bg-gray-300 flex-grow"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                name="firstName"
                placeholder="Name"
                value={formData.firstName || ""}
                onChange={updateField}
                required
                className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ""}
                onChange={updateField}
                required
                className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password || ""}
                onChange={(e) => {
                  updateField(e);
                }}
                required
                className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
              />
              <input
                name="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.repeatPassword || ""}
                onChange={updateField}
                required
                className="w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
              />
              {!passwordMatch && formData.repeatPassword && (
                <p className="text-red-500 text-xs pl-1">Passwords do not match</p>
              )}
              <div className="pl-1 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600"></span>
                  <span>Your password must include at least</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${passwordStatus === "green" ? "bg-green-500" : passwordStatus === "yellow" ? "bg-yellow-500" : "bg-red-500"}`}></span>
                  <span className="ml-1">8 characters</span>
                </div>
              </div>
              <label className="flex items-center text-sm flex-wrap gap-x-1">
                <input type="checkbox" className="mr-2 accent-orange-500" required />
                I agree to the
                <a href="/terms.html" className="underline text-blue-600 hover:text-blue-800">Terms of Service</a>,
                <a href="/privacy.html" className="underline text-blue-600 hover:text-blue-800">Privacy Policy</a> and
                <a href="/cookies.html" className="underline text-blue-600 hover:text-blue-800">Cookie Policy</a>.
              </label>

              <button
                type="submit"
                className="w-full bg-blue-100 hover:bg-blue-200 text-gray-800 font-bold py-3 rounded-lg border-2 border-orange-400 transition-all"
              >
                Sign up
              </button>
              <p className="text-sm text-center text-gray-600 mt-3">
                Already have an account?
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setStep("choose");
                    setShowLoginForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 ml-1 font-medium transition-colors"
                >
                  Log in
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_CONTACT;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function ContactForm() {
  const formRef = useRef();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+49",
    phone: "",
    email: "",
    reason: "",
    message: "",
    file: null
  });
  const [verified, setVerified] = useState(false);
  const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
  const isRecaptchaConfigured = Boolean(RECAPTCHA_SITE_KEY);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleRecaptcha = (value) => {
    setVerified(!!value);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!isEmailConfigured) {
      setStatus("Email sending is not configured. Add REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_CONTACT and REACT_APP_EMAILJS_PUBLIC_KEY.");
      return;
    }

    if (!isRecaptchaConfigured) {
      setStatus("reCAPTCHA is not configured. Add REACT_APP_RECAPTCHA_SITE_KEY to your .env.");
      return;
    }

    if (!verified) {
      setStatus("⚠️ Please verify reCAPTCHA.");
      return;
    }

    let base64File = "";

    if (form.file) {
      try {
        base64File = await toBase64(form.file);
      } catch (error) {
        console.error("File conversion error:", error);
        setStatus("❌ Failed to read file.");
        return;
      }
    }

    const templateParams = {
      firstName: form.firstName,
      lastName: form.lastName,
      countryCode: form.countryCode,
      phone: form.phone,
      email: form.email,
      reason: form.reason,
      message: form.message,
      file: base64File
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        setStatus("Message sent successfully!");
        setForm({
          firstName: "",
          lastName: "",
          countryCode: "+49",
          phone: "",
          email: "",
          reason: "",
          message: "",
          file: null
        });
        setVerified(false);
      })
      .catch((err) => {
        console.error("EmailJS error:", err);
        setStatus("Something went wrong. Try again.");
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-black uppercase tracking-wider">Contact Us</h2>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-4 text-sm text-black"
      >
        {/* Name */}
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block mb-1 font-semibold uppercase tracking-wider">First Name *</label>
            <input type="text" name="firstName" required value={form.firstName} onChange={handleChange} className="w-full p-2 border border-black/30 rounded" />
          </div>
          <div className="w-1/2">
            <label className="block mb-1 font-semibold uppercase tracking-wider">Last Name</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full p-2 border border-black/30 rounded" />
          </div>
        </div>

        {/* Phone */}
        <div className="flex gap-3">
          <div className="w-1/3">
            <label className="block mb-1 font-semibold uppercase tracking-wider">Code</label>
            <select name="countryCode" value={form.countryCode} onChange={handleChange} className="w-full p-2 border border-black/30 rounded">
              <option value="+49">+49 (DE)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+880">+880 (BD)</option>
            </select>
          </div>
          <div className="w-2/3">
            <label className="block mb-1 font-semibold uppercase tracking-wider">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border border-black/30 rounded" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold uppercase tracking-wider">Email *</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full p-2 border border-black/30 rounded" />
        </div>

        {/* Reason */}
        <div>
          <label className="block mb-1 font-semibold uppercase tracking-wider">Reason *</label>
          <select name="reason" required value={form.reason} onChange={handleChange} className="w-full p-2 border border-black/30 rounded">
            <option value="">Select Reason</option>
            <option>Improvement for Website</option>
            <option>Legal Inquiry</option>
            <option>Account-Related Question</option>
            <option>Subscription-Related Question</option>
            <option>Delete Account Query</option>
            <option>Change Account Details</option>
            <option>Others</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block mb-1 font-semibold uppercase tracking-wider">Message *</label>
          <textarea name="message" required rows="4" value={form.message} onChange={handleChange} className="w-full p-2 border border-black/30 rounded" />
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-1 font-semibold uppercase tracking-wider">Attach File (1 file only)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full p-2 border border-black/30 rounded bg-white" />
          {form.file && (
            <div className="text-sm mt-2 flex justify-between items-center">
              <span>{form.file.name}</span>
              <button type="button" onClick={() => setForm(prev => ({ ...prev, file: null }))} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          )}
        </div>

        {/* CAPTCHA */}
        {RECAPTCHA_SITE_KEY ? (
          <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={handleRecaptcha} />
        ) : (
          <p className="text-sm text-red-600">
            reCAPTCHA is not configured. Add <span className="font-mono">REACT_APP_RECAPTCHA_SITE_KEY</span> to your <span className="font-mono">.env</span>.
          </p>
        )}

        {status && (
          <p className={`text-center text-sm ${status.includes("✅") ? "text-green-600" : "text-red-600"} mt-2`}>
            {status}
          </p>
        )}

        <button type="submit" className="w-full py-2 px-4 bg-black hover:bg-gray-800 text-white font-semibold uppercase tracking-wider rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

const timeAgo = (timestamp) => {
  if (!timestamp?.seconds) return "";
  const now = Date.now();
  const reviewTime = timestamp.seconds * 1000;
  const diff = Math.floor((now - reviewTime) / 1000); // in seconds

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(reviewTime).toLocaleDateString();
};

function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const ADMIN_EMAIL = "support@lebide.de"; // or your actual Gmail address
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null); // which review is being edited
  const handleDelete = async (uid) => {
    if (!window.confirm("Delete this review?")) return;

    await deleteDoc(doc(db, "reviews", uid));

    setReviews(prev => prev.filter(r => r.uid !== uid));
    toast.success("✅ Review deleted");
  };

  const handleEdit = (rev) => {
    setComment(rev.comment);
    setRating(rev.rating);
    setEditId(rev.uid);         // used to track which review is being edited
    setEditing(true);           // switch to edit mode
    window.scrollTo({ top: 0, behavior: "smooth" }); // optional scroll
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const user = auth.currentUser;

  const fetchReviews = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "reviews"));
    const data = snapshot.docs
      .map(docItem => docItem.data())
      .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
    setReviews(data);
    setLoading(false);
  }, []);

  const handleReaction = async (reviewId, emoji) => {
    const uid = user?.uid;
    if (!uid) return;

    const ref = doc(db, "reviews", reviewId);
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const currentReactions = data.reactions || {};
    const userReactions = data.userReactions || {};

    const previous = userReactions[uid];

    // Step 1: Remove previous emoji if same
    if (previous === emoji) {
      const updatedReactions = {
        ...currentReactions,
        [emoji]: Math.max((currentReactions[emoji] || 1) - 1, 0)
      };
      delete userReactions[uid];

      await setDoc(ref, {
        reactions: updatedReactions,
        userReactions
      }, { merge: true });

      setReviews(prev => prev.map(r =>
        r.uid === reviewId
          ? { ...r, reactions: updatedReactions, userReactions: { ...userReactions } }
          : r
      ));

      return;
    }

    // Step 2: Switch emoji
    const updatedReactions = {
      ...currentReactions,
      [emoji]: (currentReactions[emoji] || 0) + 1
    };

    if (previous) {
      updatedReactions[previous] = Math.max((currentReactions[previous] || 1) - 1, 0);
    }

    const updatedUserReactions = {
      ...userReactions,
      [uid]: emoji
    };

    await setDoc(ref, {
      reactions: updatedReactions,
      userReactions: updatedUserReactions
    }, { merge: true });

    setReviews(prev => prev.map(r =>
      r.uid === reviewId
        ? { ...r, reactions: updatedReactions, userReactions: updatedUserReactions }
        : r
    ));
  };
  const checkIfSubmitted = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, "reviews", user.uid);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      setSubmitted(true);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return alert("Please log in to submit feedback.");
    if (!rating || comment.length < 5) return alert("Please complete the review.");

    const ref = doc(db, "reviews", user.uid);
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      rating,
      comment,
      timestamp: Timestamp.now()
    });

    setSubmitted(true);
    setReviews(prev => [
      { uid: user.uid, name: user.displayName, rating, comment, timestamp: new Date() },
      ...prev
    ]);
    setEditing(false);
    setEditId(null);
    setComment("");
    setRating(0);
    fetchReviews();
    toast.success(editId ? "Review updated!" : "Review submitted!");
  };

  useEffect(() => {
    fetchReviews();             // ✅ always fetch reviews
    if (user) checkIfSubmitted();
  }, [checkIfSubmitted, fetchReviews, user]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Give Feedback</h2>

      {(submitted && !editing) ? (
        <p className="text-green-600 font-medium">Thank you! You've already submitted a review.</p>
      ) : (
        <div>
          <div className="flex space-x-1 text-yellow-500 text-2xl sm:text-3xl mb-2">
            {[1, 2, 3, 4, 5].map(num => (
              <span
                key={num}
                onClick={() => setRating(num)}
                className={rating >= num ? "text-yellow-500 cursor-pointer" : "text-gray-300 cursor-pointer"}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm"
            maxLength={500}
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write your review here (max 500 characters)..."
          />

          <button
            onClick={handleSubmit}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? "Update Review" : "Submit Review"}
          </button>

          {editing && (
            <button
              onClick={() => {
                setEditing(false);
                setEditId(null);
                setComment("");
                setRating(0);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <hr className="my-6" />
      {averageRating && (
        <div className="mb-4 text-sm text-gray-700 flex items-center gap-2">
          <span className="text-yellow-500 text-xl">★</span>
          <span><strong>{averageRating}</strong> average from {reviews.length} reviews</span>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Recent Reviews</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((rev, i) => (
            <li key={i} className="border-b pb-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                <div className="flex flex-col">
                  <strong>{rev.name}</strong>
                  <span className="text-yellow-500 text-sm">{"★".repeat(rev.rating)}</span>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(rev.timestamp)}</span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>

              <div className="mt-1 flex gap-1 text-[12px] sm:text-[13px]">
                {["👍", "❤️", "😂"].map(emoji => {
                  const isSelected = rev.userReactions?.[user?.uid] === emoji;
                  return (
                    <button
                      key={emoji}
                      className={`hover:scale-110 transition-transform text-[11px] ${isSelected ? "text-blue-600 font-bold" : ""}`}
                      onClick={() => handleReaction(rev.uid, emoji)}
                    >
                      {emoji} {rev.reactions?.[emoji] || 0}
                    </button>
                  );
                })}
              </div>
              {/* User-specific edit/delete buttons */}
              {user?.uid === rev.uid && (
                <div className="mt-2 flex gap-4 text-xs">
                  <button onClick={() => handleEdit(rev)} className="text-black hover:underline">edit</button>
                  <button onClick={() => handleDelete(rev.uid)} className="text-black hover:underline">delete</button>
                </div>
              )}

              {user?.email === ADMIN_EMAIL && (
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => handleDelete(rev.uid)}
                    className="text-xs text-red-500 underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEdit(rev)}
                    className="text-xs text-blue-500 underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

const languages = [
  { code: "EN", label: "EN", flag: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb.svg" },
  { code: "DE", label: "DE", flag: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/de.svg" }
];

function LanguageSelector() {
  const [language, setLanguage] = useState("DE");
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef();

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setLangOpen(false);
    };
    if (langOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  const selected = languages.find(l => l.code === language);

  return (
    <div className="relative" ref={ref}>
      {/* Selector pill */}
      <button
        className="flex items-center w-32 justify-between px-4 py-2 rounded-2xl"
        style={{
          border: "none",
          minWidth: "104px",
          minHeight: "44px",
          background: "transparent",
          boxShadow: "none"
        }}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        onClick={() => setLangOpen(v => !v)}
      >
        <span className="flex items-center gap-2">
          <img
            src={selected.flag}
            alt={selected.code}
            style={{
              width: "24px",
              height: "16px", // Use 4:3 ratio for flag, no border radius for square
              borderRadius: 0,
              background: "transparent",
              boxShadow: "none",
              border: "none",
              display: "block",
              objectFit: "cover"
            }}
          />
          <span className="text-lg font-semibold text-gray-700">{selected.label}</span>
        </span>
        <svg className={`ml-2 w-4 h-4 text-gray-500 transition-transform ${langOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {langOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 rounded-2xl py-2 w-36 z-50 flex flex-col items-center"
          style={{
            border: "none",
            background: "transparent",
            boxShadow: "none"
          }}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              className="flex items-center justify-between w-full px-4 py-2 rounded-xl transition group"
              style={{
                background: "transparent",
                boxShadow: "none",
                border: "none"
              }}
              onClick={() => {
                setLanguage(lang.code);
                setLangOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                <img
                  src={lang.flag}
                  alt={lang.code}
                  style={{
                    width: "24px",
                    height: "16px", // Square/rect, no border radius, transparent bg
                    borderRadius: 0,
                    background: "transparent",
                    boxShadow: "none",
                    border: "none",
                    display: "block",
                    objectFit: "cover"
                  }}
                />
                <span className="text-md font-medium text-gray-700">{lang.label}</span>
              </span>
              {lang.code === language && (
                <svg className="ml-2 w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#2b72e9" strokeWidth="2.5" fill="none" />
                  <path d="M9.3 12.1l2.1 2.3 3.2-4.2" stroke="#2b72e9" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Swap to your own icon images as needed
const shareLinks = [
  {
    name: "Facebook",
    icon: <img src="/assets/facebook.png" alt="Facebook" width={36} height={36} />,
    url: link => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
  },
  {
    name: "WhatsApp",
    icon: <img src="/assets/whatsapp.png" alt="WhatsApp" width={36} height={36} />,
    url: link => `https://wa.me/?text=${encodeURIComponent(link)}`
  },
  {
    name: "X",
    icon: <img src="/assets/x.png" alt="X" width={36} height={36} />,
    url: link => `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`
  },
  {
    name: "Email",
    icon: <img src="/assets/email.png" alt="Email" width={36} height={36} />,
    url: link => `mailto:?subject=Check%20this%20out&body=${encodeURIComponent(link)}`
  }
];

const HEADER_HEIGHT = 76; // px (adjust if your header is different)

function ShareCard({ link, onClose }) {
  const ref = useRef();
  const [copied, setCopied] = useState(false);

  // Auto-close after copy
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied, onClose]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      alert("Could not copy!");
    }
  };

  return (
    <div
      className="fixed left-0 w-full z-[9999] flex justify-center items-start"
      style={{
        top: HEADER_HEIGHT,
        minHeight: 0,
        pointerEvents: "none"
      }}
    >
      <div
        ref={ref}
        className={`
          w-full max-w-md mx-2
          rounded-3xl border border-blue-100
          shadow-xl
          bg-gradient-to-br from-blue-100/70 via-violet-100/80 to-white/90
          backdrop-blur-2xl
          animate-slideDown
          pointer-events-auto
          transition-all
          ring-1 ring-blue-200/50
        `}
        style={{
          boxShadow: "0 8px 48px 0 rgba(98, 107, 255, 0.20), 0 2px 8px 0 rgba(40,30,140,0.08)",
          marginTop: "0.7rem"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-violet-100 bg-white/70 rounded-t-3xl">
          <div className="font-bold text-lg text-blue-700 tracking-tight">Share</div>
          <button
            className="text-2xl text-gray-400 hover:text-blue-700 p-2 -mr-2 rounded-full transition"
            onClick={onClose}
            aria-label="Close"
            tabIndex={0}
          >
            <FiX />
          </button>
        </div>

        {/* Social icons row */}
        <div className="flex items-center justify-center gap-6 px-6 pt-5 pb-1 bg-gradient-to-r from-blue-50/50 via-violet-50/60 to-white/30 rounded-t-lg">
          {shareLinks.map(item => (
            <a
              key={item.name}
              href={item.url(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-blue-100 shadow hover:scale-110 active:scale-95 transition p-1 bg-white/95"
              title={item.name}
            >
              {item.icon}
            </a>
          ))}
        </div>
        {/* Label Row */}
        <div className="flex items-center justify-center gap-7 px-6 pb-2 pt-1 text-xs text-blue-400">
          {shareLinks.map(item => (
            <span key={item.name} className="w-16 text-center">{item.name}</span>
          ))}
        </div>

        {/* Link + Copy */}
        <div className="flex gap-2 px-6 pb-6 pt-2">
          <input
            type="text"
            className="w-full rounded-lg border border-blue-100 px-3 py-2 text-sm bg-white/85 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
            value={link}
            readOnly
            style={{ fontFamily: "monospace" }}
            onFocus={e => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-br from-violet-500 to-blue-600 hover:from-violet-700 hover:to-blue-700 transition ${
              copied ? "bg-green-500 hover:bg-green-500" : ""
            }`}
            title="Copy link"
          >
            {copied ? "Copied!" : <span className="flex items-center gap-1"><FiCopy className="text-lg" /> Copy</span>}
          </button>
        </div>
      </div>
      {/* Slide-down animation */}
      <style>{`
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-24px) scale(0.98);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-slideDown {
          animation: slideDown 0.34s cubic-bezier(.32,1.3,.55,1) 1;
        }
      `}</style>
    </div>
  );
}

function WrongList({
  allQuestions,
  language,
  userData,
  startQuizWithQuestions = () => {}
}) {
  const [minWrongCount, setMinWrongCount] = useState(1);
  // Always calculate wrongQuestions and sortedQuestions
  const wrongQuestions = (() => {
    if (!allQuestions || allQuestions.length === 0) return [];
    const wrongIds = getWrongAnswerIds();
    return allQuestions.filter(q => wrongIds.includes(String(q.id)));
  })();
  // Remove filter for minWrongCount (for debug)
  const sortedQuestions = useMemo(
    () => [...wrongQuestions].sort((a, b) => {
      const countA = userData?.wrongStats?.[a.id] || 0;
      const countB = userData?.wrongStats?.[b.id] || 0;
      return countB - countA;
    }),
    [wrongQuestions, userData]
  );
  // Show loading if no questions loaded yet
  if (!allQuestions || allQuestions.length === 0) {
    return <div>Loading all questions…</div>;
  }
  // Show "no wrong questions" message
  if (wrongQuestions.length === 0) {
    return (
      <section className="max-w-3xl mx-auto p-4 animate-fadeIn">
        <div className="p-8 rounded-2xl bg-gray-50 text-gray-400 text-center shadow mb-8">
          <span className="text-lg font-semibold">
            Keine Fragen gefunden mit dieser Fehleranzahl.
          </span>
        </div>
      </section>
    );
  }
  // --- PDF EXPORT HANDLER ---
  const handleExportPDF = () => {
    const docItem = new jsPDF();
    docItem.setFontSize(18);
    docItem.text("Falsche Antworten (Wrong Answers)", 14, 18);

    const tableColumn = ["#", "Frage/Question", "Fehler (Wrong Count)"];
    const tableRows = sortedQuestions.map((q, idx) => [
      idx + 1,
      (q.question?.[language] || q.question?.de || "").replace(/\n/g, " "),
      userData?.wrongStats?.[q.id] || 0
    ]);

    autoTable(docItem, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 11, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [255, 99, 132] },
      margin: { left: 10, right: 10 }
    });

    docItem.save("falsche-antworten.pdf");
  };
  return (
    <section className="max-w-6xl mx-auto p-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-3 px-2 bg-white/80 rounded-3xl shadow-lg border border-gray-100 mb-7 max-w-6xl mx-auto">
        {/* Left Side: Title & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-4xl text-red-500 font-black drop-shadow-sm"></span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 tracking-tight flex items-center">
              Falsche Antworten
              <span className="ml-2 text-lg font-bold text-gray-400">({sortedQuestions.length})</span>
            </h2>
          </div>
          <div className="mt-1 ml-1 text-gray-500 font-medium text-[15px] sm:text-base leading-tight">
            Nach Häufigkeit sortiert.
            <span className="ml-2 text-pink-500 font-semibold">Trainiere gezielt deine Schwächen!</span>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-4">
          {/* Fehler Filter */}
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-4 py-2 rounded-2xl shadow-sm">
            <label className="text-sm font-bold text-pink-700">Min. Fehler:</label>
            <select
              value={minWrongCount}
              onChange={e => setMinWrongCount(Number(e.target.value))}
              className="px-8 py-2 bg-pink-50 rounded-full border-2 border-pink-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 shadow"
            >
              {[1, 2, 3, 5].map(n => (
                <option key={n} value={n}>{n}+ Fehler</option>
              ))}
            </select>
          </div>
          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-1 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 text-white text-base font-extrabold rounded-full shadow-md hover:from-pink-600 hover:to-pink-800 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 18 18 ">
              <path d="M12 19V6m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export PDF
          </button>

        </div>
      </div>
      {sortedQuestions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-gradient-to-br from-pink-50 via-yellow-50 to-white flex flex-col items-center justify-center shadow-xl mb-10 border border-pink-100">
          <div className="mb-4">
            <svg className="w-16 h-16 text-pink-200" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="#fdf2f8" />
              <path d="M32 32c0-4-8-4-8-4s-8 0-8 4" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="17" cy="21" r="2.5" fill="#f43f5e" />
              <circle cx="31" cy="21" r="2.5" fill="#f43f5e" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-pink-400 mb-2">Keine Fragen gefunden</span>
          <span className="text-base font-medium text-gray-400">mit dieser Fehleranzahl.</span>
          <span className="text-sm mt-4 text-gray-300">Probiere, mehr Fragen falsch zu beantworten, um hier etwas zu sehen!</span>
        </div>
      ) : (
        //done
        <ul className="grid sm:grid-cols-2 md:grid-cols-3  gap-7 mt-6">
          {sortedQuestions.map((q, index) => (
            <li
              key={q.id}
              className="
                rounded-3xl shadow-xl bg-white/80 backdrop-blur-lg
                border border-pink-200
                p-6 flex flex-col group transition-all duration-300
                hover:scale-[1.04] hover:bg-pink-50/60 hover:border-pink-400
                hover:shadow-2xl
                relative
                "
            >
              <span className="absolute -top-4 left-5 z-10 text-white font-black text-base px-4 py-1 rounded-2xl bg-gradient-to-r from-pink-400 to-yellow-400 shadow-md select-none">
                #{index + 1}
              </span>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[18px] font-bold text-pink-600">
                  {q.question?.[language] || q.question?.de}
                </span>
              </div>
              <ul className="pl-0 mt-3 mb-3 space-y-1 text-[15px]">
                {Object.entries(q.options || {}).map(([key, val]) => (
                  <li key={key}
                    className={`
                      flex gap-2 items-center
                      rounded-xl px-3 py-1.5
                      ${key === q.correctAnswer
                        ? "bg-green-50 border-l-4 border-green-400 font-bold text-green-700"
                        : "bg-gray-50 text-gray-700"
                      }
                      hover:bg-yellow-100 transition
                    `}>
                    <span className="inline-block w-6 font-extrabold text-blue-600">{key.toUpperCase()}.</span>
                    <span>{val?.[language] || val?.de}</span>
                    {key === q.correctAnswer && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-semibold">Correct</span>
                    )}
                  </li>
                ))}
              </ul>
              {userData?.wrongStats?.[q.id] &&
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-3 py-1 rounded-full font-bold shadow bg-pink-100 text-pink-600">
                    {userData.wrongStats[q.id]}x falsch
                  </span>
                </div>
              }
            </li>
          ))}
        </ul>
        //done
      )}

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => startQuizWithQuestions(sortedQuestions)}
          disabled={sortedQuestions.length === 0}
          aria-disabled={sortedQuestions.length === 0}
          className={`relative flex items-center gap-3 px-10 py-4 rounded-full 
            bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400
            text-white font-extrabold text-xl shadow-2xl
            transition-all duration-300 ease-in-out
            hover:scale-105 hover:shadow-pink-200
            focus:outline-none focus:ring-4 focus:ring-pink-200
            ${sortedQuestions.length === 0 ? "opacity-50 cursor-not-allowed grayscale" : "animate-pulse"}
          `}
        >
          <span className="text-2xl">🎯</span>
          <span>Starte Quiz mit diesen Fragen</span>
          <svg
            className="w-7 h-7 ml-1 text-yellow-200 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            style={{
              opacity: sortedQuestions.length === 0 ? 0.25 : 1,
              transition: "opacity 0.3s"
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </button>
      </div>

    </section>
  );
}

const Footer = memo(function Footer({ setPhase }) {
  return (
    <footer className="w-full bg-gray-900 text-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Newsletter Section */}
        <div className="mb-12 p-8 bg-gray-800 rounded-xl text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-3">Bleiben Sie informiert</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Abonnieren Sie unseren Newsletter für Bildungsupdates und Einwanderungstipps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
            />
            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>Abonnieren</span>
              <RiSendPlaneFill />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Wir respektieren Ihre Privatsphäre. <a href="/privacy.html" className="text-orange-400 hover:underline">Datenschutzbestimmungen</a>
          </p>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaGraduationCap className="text-3xl text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-white">LebiDE</h1>
                <p className="text-sm text-orange-400">Bildung für Neulinge</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Ein Unternehmen der <span className="font-semibold text-white">Bildungsgruppe Deutschland</span>.
              Wir unterstützen neue Bürger beim Start in Deutschland.
            </p>

            {/* Language Selector */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <FaLanguage className="text-orange-400" />
                <span>Sprache:</span>
                <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
                  <option>Deutsch</option>
                  <option>English</option>
                  <option>العربية</option>
                  <option>فارسی</option>
                  <option>Türkçe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaHeadset className="text-orange-400" />
              Kundenservice
            </h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setPhase("contact")} className="flex items-center gap-2 group">
                  <FaEnvelope className="text-orange-400" />
                  <span className="text-gray-100 group-hover:text-white transition-colors text-sm">
                    Kontakt
                  </span>
                </button>
              </li>
              <li>
                <a href="tel:+4917664069892" className="flex items-center gap-2 group">
                  <FaPhoneAlt className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Anrufen
                  </span>
                </a>
              </li>
              <li>
                <a href="/faq.html" className="flex items-center gap-2 group">
                  <FaQuestionCircle className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    FAQ
                  </span>
                </a>
              </li>
              <li>
                <a href="/support" className="flex items-center gap-2 group">
                  <FaHeadset className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Support
                  </span>
                </a>
              </li>
              <li>
                <button onClick={() => setPhase("feedback")} className="flex items-center gap-2 group">
                  <FaCommentAlt className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Feedback
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaBalanceScale className="text-orange-500" />
              Rechtliches
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/delete-account.html" className="flex items-center gap-2 group">
                  <FaTrashAlt className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Konto löschen
                  </span>
                </a>
              </li>
              <li>
                <a href="/terms.html" className="flex items-center gap-2 group">
                  <FaFileAlt className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    AGB
                  </span>
                </a>
              </li>
              <li>
                <a href="/privacy.html" className="flex items-center gap-2 group">
                  <FaShieldAlt className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Datenschutz
                  </span>
                </a>
              </li>
              <li>
                <a href="/cookies.html" className="flex items-center gap-2 group">
                  <FaCookieBite className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Cookies
                  </span>
                </a>
              </li>
              <li>
                <a href="/legal-notice.html" className="flex items-center gap-2 group">
                  <FaBalanceScale className="text-orange-400" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    Impressum
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaBook className="text-orange-500" />
              Bildungsressourcen
            </h3>
            <ul className="space-y-3">
              {[
                { icon: <FaBook className="text-orange-400" />, text: "Deutschkurse (A1-C2)", href: "/courses" },
                { icon: <FaHome className="text-orange-400" />, text: "Wohnungssuche", href: "/housing" },
                { icon: <FaBriefcase className="text-orange-400" />, text: "Arbeitsrecht", href: "/labor-law" },
                { icon: <FaHandsHelping className="text-orange-400" />, text: "Integrationskurse", href: "/integration" },
                { icon: <FaGlobeEurope className="text-orange-400" />, text: "Kulturtraining", href: "/culture" }
              ].map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="flex items-center gap-2 group">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                      {item.text}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              Standorte
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Berlin</p>
                  <p className="text-gray-400 text-xs">Musterstr. 123, 10115 Berlin</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Duisburg</p>
                  <p className="text-gray-400 text-xs">MusterStr. 1, 47051 Duisburg</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Öffnungszeiten</p>
                  <p className="text-gray-400 text-xs">Mo-Fr: 9:00-18:00 Uhr</p>
                  <p className="text-gray-400 text-xs">Sa: 10:00-14:00 Uhr</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Social */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-500 text-sm text-center md:text-left">
              <p>© {new Date().getFullYear()} LebiDE - Bildungsgruppe Deutschland. Alle Rechte vorbehalten.</p>
              <p className="mt-1">USt-IdNr.: DE123456789 | Handelsregister: HRB 12345</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="/privacy.html" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Datenschutz</a>
              <a href="/terms.html" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">AGB</a>
              <a href="/legal-notice.html" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Impressum</a>
              <a href="/barrierefreiheit" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Barrierefreiheit</a>
              <a href="/haftungsausschluss" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Haftungsausschluss</a>
            </div>

            <div className="flex gap-4">
              <a href="https://www.facebook.com" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="text-lg" />
              </a>
              <a href="https://www.twitter.com" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="text-lg" />
              </a>
              <a href="https://www.instagram.com" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="text-lg" />
              </a>
              <a href="https://www.linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

function LoginModal({
  setShowLoginModal,
  authMode,
  setAuthMode,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
  showPassword,
  setShowPassword,
  showRepeatPassword,
  setShowRepeatPassword,
  formData,
  setFormData,
  handleAuth,
  handleGoogleLogin,
  handleFacebookLogin,
  handleAppleLogin,
  handleMicrosoftLogin,
  handleGithubLogin,
  handleAnonymousLogin,
  handleForgotPassword,
  setPhase
}) {
  return (

    <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-[2px] z-50 flex items-center justify-center">
      <div className="w-[95%] sm:w-[90%] md:w-[400px] lg:w-[420px] xl:w-[450px] bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 relative">

        {/* ❌ Close Button */}
        <button
          onClick={() => {
            setShowLoginModal(false);
            setPhase && setPhase("home"); // ✅ safely go back if setPhase is passed
          }}
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black font-bold"
        >
          &times;
        </button>

        <AuthForm
          handleAuth={handleAuth}
          handleGoogleLogin={handleGoogleLogin}
          handleFacebookLogin={handleFacebookLogin}
          handleAppleLogin={handleAppleLogin}
          handleMicrosoftLogin={handleMicrosoftLogin}
          handleGithubLogin={handleGithubLogin}
          handleAnonymousLogin={handleAnonymousLogin}
          handleForgotPassword={handleForgotPassword}
          authMode={authMode}
          setAuthMode={setAuthMode}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          repeatPassword={repeatPassword}
          setRepeatPassword={setRepeatPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showRepeatPassword={showRepeatPassword}
          setShowRepeatPassword={setShowRepeatPassword}
          formData={formData}
          setFormData={setFormData}
          setPhase={setPhase}
        />
      </div>
    </div>
  );
}

export {
  AuthForm,
  ContactForm,
  FeedbackForm,
  Footer,
  LanguageSelector,
  LoginModal,
  ShareCard,
  WrongList
};
