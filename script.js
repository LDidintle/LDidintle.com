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
    formData.set("name", formData.get("name").trim());
    formData.set("email", formData.get("email").trim());
    formData.set("message", formData.get("message").trim());

    try {
      const response = await fetch("https://formspree.io/f/maqyvlwg", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      contactForm.reset();
      formStatus.style.color = "green";
      formStatus.textContent = "Message sent successfully.";

      setTimeout(() => {
        formStatus.textContent = "";
      }, 4000);
    } catch {
      formStatus.style.color = "red";
      formStatus.textContent = "Something went wrong. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}
