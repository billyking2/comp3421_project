<template>
  <section
    class="form-card"
    :class="{ 'form-card--embedded': embedded }"
    :aria-labelledby="titleId"
  >
    <header class="form-card-heading">
      <span class="eyebrow">{{ eyebrow }}</span>
      <component :is="headingLevel" :id="titleId">{{ title }}</component>
    </header>

    <div class="form-card-content">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="form-card-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    titleId: string;
    headingLevel?: 'h1' | 'h2' | 'h3';
    embedded?: boolean;
  }>(),
  {
    headingLevel: 'h1',
    embedded: false,
  },
);
</script>

<style scoped>
.form-card {
  --form-card-ink: #38332d;
  --form-card-muted: #827a70;
  --form-card-line: #d7d1c8;
  --form-card-brown: #80654d;

  box-sizing: border-box;
  width: min(100% - 36px, 480px);
  margin: clamp(32px, 7vh, 40px) auto;
  padding: clamp(26px, 6vw, 44px);
  border: 1px solid var(--form-card-line);
  background: #fffdfa;
  box-shadow: 0 16px 42px rgb(44 37 29 / 8%);
  color: var(--form-card-ink);
  text-align: left;
}

.form-card--embedded {
  width: 100%;
  height: 100%;
  margin: 0;
}

.form-card-heading {
  margin-bottom: 30px;
}

.eyebrow {
  color: var(--form-card-brown);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.form-card-heading h1,
.form-card-heading h2,
.form-card-heading h3 {
  margin: 12px 0 8px;
  color: var(--form-card-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(28px, 5vw, 36px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.form-card-content :deep(.auth-form .el-form-item) {
  margin-bottom: 20px;
}

.form-card-content :deep(.auth-form .el-form-item__label) {
  color: var(--form-card-ink);
  font-size: 12px;
  font-weight: 600;
}

.form-card-content :deep(.auth-form .el-input__wrapper) {
  min-height: 44px;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--form-card-line) inset;
}

.form-card-content :deep(.auth-form .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--form-card-brown) inset;
}

.form-card-content :deep(.auth-error) {
  margin: 0 0 18px;
}

.form-card-content :deep(.auth-submit) {
  width: 100%;
  min-height: 46px;
  border-color: var(--form-card-ink);
  border-radius: 2px;
  background: var(--form-card-ink);
  font-size: 13px;
  letter-spacing: 0.03em;
}

.form-card-content :deep(.auth-submit:hover) {
  border-color: var(--form-card-brown);
  background: var(--form-card-brown);
}

.form-card-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--form-card-line);
  color: var(--form-card-muted);
  font-size: 12px;
}

.form-card-footer :deep(.auth-link) {
  color: var(--form-card-brown);
  font-weight: 600;
  text-underline-offset: 3px;
}

@media (max-width: 480px) {
  .form-card:not(.form-card--embedded) {
    margin-block: 24px;
  }
}
</style>
