import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

Modal.setAppElement("#root"); // Set the root element for accessibility

const ProvideCertificate = () => {
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [template, setTemplate] = useState("");
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [periodFromDate, setPeriodFromDate] = useState("");
  const [periodToDate, setPeriodToDate] = useState("");
  const [date, setDate] = useState("");
  const [internship, setInternship] = useState("");
  const [grade, setGrade] = useState("");
  const [preview, setPreview] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePreview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "//admin.kshitiksha.xyz/api/previewCertificate",
        {
          email,
          gender,
          template,
          name,
          internship,
          period,
          periodFromDate,
          periodToDate,
          date,
          grade,
        }
      );
      setPreview(response.data.previewUrl || "");
    } catch (error) {
      console.error("Error generating certificate preview", error);
      alert("Failed to generate certificate preview");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "//admin.kshitiksha.xyz/api/sendCertificate",
        {
          email,
          gender,
          template,
          name,
          internship,
          period,
          periodFromDate,
          periodToDate,
          date,
          grade,
        }
      );
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending certificate", error);
      setLoading(false);
      alert("Failed to send certificate");
    }
  };

  const renderFields = () => {
    switch (template) {
      case "template1": // Letter Of Recommendation
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </>
        );
      case "template2": // Certificate Of Experience
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">
                Type of Internship:
              </label>
              <select
                value={internship}
                onChange={(e) => setInternship(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select an option</option>
                <option value="Social Media Marketing">
                  Social Media Marketing
                </option>
                <option value="Content Writing">Content Writing</option>
                <option value="Volunteering">Volunteering</option>
                <option value="Product & Online Marketing">
                  Product & Online Marketing
                </option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">
                Period (e.g., hours, dates, weeks):
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">From Date:</label>
              <input
                type="date"
                value={periodFromDate}
                onChange={(e) => setPeriodFromDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">To Date:</label>
              <input
                type="date"
                value={periodToDate}
                onChange={(e) => setPeriodToDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Grade:</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </>
        );
      case "template3": // Certificate Of Appreciation
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Provide Certificate
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Gender:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-gray-700">
              Certificate Template:
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Template</option>
              <option value="template2">Certificate Of Experience</option>
              <option value="template1">Letter Of Recommendation</option>
              <option value="template3">Certificate Of Appreciation</option>
            </select>
          </div>

          {renderFields()}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handlePreview}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Preview Certificate
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Send Certificate
            </button>
          </div>
        </form>

        <Modal
          isOpen={!!preview}
          onRequestClose={() => setPreview("")}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg relative max-w-96 mx-auto">
            <button
              onClick={() => setPreview("")}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-center mb-4">
              Certificate Preview
            </h2>
            {preview ? (
              <div className="text-center">
                <img
                  src={preview}
                  alt="Certificate Preview"
                  className="max-w-full"
                />
              </div>
            ) : (
              <p className="text-center text-gray-700">Loading preview...</p>
            )}
          </div>
        </Modal>

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <FaSpinner className="text-white text-6xl animate-spin" />
          </div>
        )}
        <Modal
          isOpen={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg relative max-w-96 mx-auto text-center">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Certificate Sent!</h2>
            <p className="text-gray-700">
              The certificate has been successfully sent to the provided email
              address.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProvideCertificate;
