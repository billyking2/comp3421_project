<template>
  <main class="contact-page">
    <section class="contact-details" aria-label="Contact details and message form">
      <div class="contact-card">
        <span class="eyebrow">GET IN TOUCH</span>
        <h2>We’re here to help</h2>
        <p class="card-intro">Choose whichever way is easiest for you.</p>

        <dl class="contact-list">
          <div>
            <dt>Email</dt>
            <dd><a href="mailto:fake@gmail.com">fake@gmail.com</a></dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd><a href="tel:+85212345678">+852 12345678</a></dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>The Hong Kong Polytechnic University (PolyU)</dd>
          </div>
          <div>
            <dt>Expected response</dt>
            <dd>Someday</dd>
          </div>
        </dl>

        <a
          class="alternative-link"
          href="https://github.com/billyking2/comp3421_project"
          target="_blank"
          rel="noopener noreferrer"
        >
          Find us on GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>

      <form class="contact-card" @submit.prevent="submitMessage">
        <span class="eyebrow">SEND A NOTE</span>
        <h2>What’s on your mind?</h2>
        <p class="card-intro">Just the basics. We’ll take it from there.</p>

        <label for="contact-name">Name</label>
        <input
          id="contact-name"
          v-model.trim="name"
          name="name"
          type="text"
          autocomplete="name"
          placeholder="Your name"
          maxlength="100"
          required
        />

        <label for="contact-email">Email</label>
        <input
          id="contact-email"
          v-model.trim="email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="example@gmail.com"
          maxlength="255"
          required
        />

        <label for="contact-message">Message</label>
        <textarea
          id="contact-message"
          v-model.trim="message"
          name="message"
          rows="4"
          placeholder="How can we help?"
          maxlength="10000"
          required
        ></textarea>

        <button class="submit-button" type="submit" :disabled="sending">
          {{ sending ? 'Sending...' : 'Send message' }}
        </button>
        <p v-if="success" class="form-success" role="status">
          Message sent successfully.
        </p>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>
    </section>

    <section class="location-section" aria-labelledby="location-title">
      <div class="location-heading">
        <div>
          <h2 id="location-title">Find us here</h2>
        </div>
        </div>

      <div class="map-frame">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.298094560418!2d114.17700177488891!3d22.30456327968348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400e809c71ff1%3A0xeb7151a34a54910d!2z6aaZ5riv55CG5bel5aSn5a24!5e0!3m2!1szh-TW!2shk!4v1794132765153!5m2!1szh-TW!2shk"
          title="Map showing the bookshop location"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>

      <p class="location-note">
        We look forward to welcoming you. Open the map for directions and the
        latest travel information.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { sendContactMessage } from '../../services/dashboardData';
import { getErrorMessage } from '../../utils/authStatus';

const name = ref('');
const email = ref('');
const message = ref('');
const sending = ref(false);
const success = ref(false);
const error = ref('');

async function submitMessage(): Promise<void> {
  if (sending.value) return;

  sending.value = true;
  success.value = false;
  error.value = '';

  try {
    await sendContactMessage({
      name: name.value,
      email: email.value,
      message: message.value,
    });
    name.value = '';
    email.value = '';
    message.value = '';
    success.value = true;
  } catch (cause) {
    error.value = getErrorMessage(cause);
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
.contact-page {
  --contact-ink: #38332d;
  --contact-muted: #827a70;
  --contact-line: #d7d1c8;
  --contact-brown: #80654d;

  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: clamp(20px, 1vw, 112px) 0 90px;
  color: var(--contact-ink);
  font-family: Arial, sans-serif;
}


.eyebrow {
  color: var(--contact-brown);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.location-note {
  color: var(--contact-muted);
  font-size: 14px;
  line-height: 1.8;
}

.contact-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(24px, 5vw, 56px);
  margin-bottom: clamp(64px, 9vw, 100px);
}

.contact-card {
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid var(--contact-line);
  background: #f5f3ee;
}

.contact-card h2 {
  margin: 10px 0 8px;
  color: var(--contact-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 400;
  letter-spacing: -0.035em;
}

.card-intro {
  margin: 0;
  color: var(--contact-muted);
  font-size: 13px;
  line-height: 1.7;
}

.contact-list {
  display: grid;
  gap: 20px;
  margin: 30px 0 24px;
}

.contact-list dt {
  margin-bottom: 5px;
  color: var(--contact-muted);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-list dd {
  margin: 0;
  color: var(--contact-ink);
  font-size: 14px;
  line-height: 1.6;
}

.contact-list a {
  color: inherit;
  text-underline-offset: 3px;
}

.alternative-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--contact-brown);
  font-size: 12px;
  text-decoration: none;
}

form.contact-card {
  display: flex;
  flex-direction: column;
}

form.contact-card label {
  margin: 19px 0 7px;
  color: var(--contact-ink);
  font-size: 12px;
  font-weight: 600;
}

form.contact-card input,
form.contact-card textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--contact-line);
  border-radius: 0;
  background: #fffdfa;
  color: var(--contact-ink);
  font: inherit;
  font-size: 13px;
}

form.contact-card textarea {
  min-height: 110px;
  resize: vertical;
}

form.contact-card input:focus,
form.contact-card textarea:focus {
  border-color: var(--contact-brown);
  outline: 2px solid rgb(128 101 77 / 18%);
  outline-offset: 1px;
}

.submit-button {
  align-self: flex-start;
  margin-top: 20px;
  padding: 11px 18px;
  border: 1px solid var(--contact-ink);
  background: var(--contact-ink);
  color: #fffdfa;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  transition:
    background-color 180ms ease,
    color 180ms ease;
}

.submit-button:hover {
  background: transparent;
  color: var(--contact-ink);
}

.submit-button:disabled {
  border-color: var(--contact-line);
  background: #e8e3da;
  color: var(--contact-muted);
  cursor: not-allowed;
}

.form-success,
.form-error {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.6;
}

.form-success {
  color: #426c4d;
}

.form-error {
  color: #a33c32;
}

.location-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--contact-line);
}

.location-heading h2 {
  margin: 8px 0 0;
  color: var(--contact-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.map-frame {
  overflow: hidden;
  height: clamp(300px, 48vw, 500px);
  border: 1px solid var(--contact-line);
  background: #e9e7e2;
  box-shadow: 0 16px 38px rgb(44 37 29 / 10%);
}

.map-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}


@media (max-width: 560px) {
  .contact-page {
    width: calc(100% - 36px);
  }

  .contact-details {
    grid-template-columns: 1fr;
  }

  .location-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .map-frame {
    height: 360px;
  }
}
</style>
