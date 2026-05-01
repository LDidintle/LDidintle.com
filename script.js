const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.style.color = "";

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    formData.set("name", name);
    formData.set("email", email);
    formData.set("message", message);
    formData.set("_replyto", email);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Formspree submission failed:", response.status, errorText);
        throw new Error("Form submission failed");
      }

      contactForm.reset();
      formStatus.style.color = "green";
      formStatus.textContent = "Message sent successfully.";

      setTimeout(() => {
        formStatus.textContent = "";
      }, 4000);
    } catch (error) {
      console.error("Contact form error:", error);
      formStatus.style.color = "red";
      formStatus.textContent = "Something went wrong. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}
