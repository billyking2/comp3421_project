<template>
  <main class="about-page">
    <section class="about-hero" aria-labelledby="about-title">
      <div class="hero-copy">
        <h1>So many books, so little time</h1>
        <h2>-Frank Zappa</h2>
        <p class="positioning">
          This website is a demo online bookshop, through a simple, welcoming place to browse.
        </p>
        <RouterLink class="primary-link" to="/book">
          Find your next read <span aria-hidden="true">↗</span>
        </RouterLink>
      </div>

      <div class="hero-art">
        <img src="/images/about-removebg-preview.png" alt="A selection of books in the shop" />
      </div>
    </section>

    <section class="story-section" aria-labelledby="story-title">
      <div class="story-copy">
        <h2 id="story-title">Polyu Web Application Development Project</h2>
        <p>
          This website was developed as part of the COMP3421 Web Application Development project. The system demonstrates full-stack web development concepts including database integration, user authentication, form validation, RESTful APIs, and responsive UI design.
        </p>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.about-page {
  --about-ink: #38332d;
  --about-muted: #827a70;
  --about-line: #d7d1c8;
  --about-brown: #80654d;

  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 88px) 0 90px;
  color: var(--about-ink);
  font-family: Arial, sans-serif;
}

.about-hero {
  display: grid;
  min-height: 430px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  align-items: center;
  gap: clamp(32px, 7vw, 90px);
  padding-bottom: clamp(56px, 9vw, 104px);
  border-bottom: 1px solid var(--about-line);
}

.hero-copy {
  max-width: 610px;
}

.hero-copy h1 {
  margin: 18px 0;
  color: var(--about-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(44px, 6.5vw, 76px);
  font-weight: 400;
  letter-spacing: -0.06em;
  line-height: 0.99;
}

.hero-copy h2 {
  margin: -4px 0 18px;
  color: var(--about-muted);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  font-style: italic;
  font-weight: 400;
}

.positioning {
  max-width: 500px;
  color: var(--about-muted);
  font-size: 15px;
  line-height: 1.8;
}

.primary-link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 26px;
  padding: 0 18px;
  border: 1px solid var(--about-ink);
  color: #fffdfa;
  background: var(--about-ink);
  font-size: 12px;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    color 180ms ease;
}

.primary-link:hover {
  color: var(--about-ink);
  background: transparent;
}

.primary-link span {
  color: #d9b99b;
  font-size: 17px;
}

.hero-art {
  overflow: hidden;
  height: clamp(270px, 32vw, 360px);
  background: rgb(255,255,255,0.5);
}

.hero-art img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.story-section {
  padding: clamp(56px, 9vw, 100px) 0;
  border-bottom: 1px solid var(--about-line);
  text-align: center;
}

.story-copy {
  width: 100%;
}

.story-copy h2 {
  margin: 0;
  color: var(--about-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.story-copy p {
  margin: 20px 0 0;
  color: var(--about-muted);
  font-size: 14px;
  line-height: 1.8;
}

@media (max-width: 760px) {
  .about-hero {
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .hero-art {
    height: 300px;
  }
}

@media (max-width: 560px) {
  .about-page {
    width: calc(100% - 36px);
  }

  .hero-copy h1 {
    font-size: clamp(42px, 12vw, 58px);
  }

  .hero-art {
    height: 270px;
  }
}
</style>
