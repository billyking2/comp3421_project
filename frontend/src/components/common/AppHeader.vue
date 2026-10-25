<template>
  <header class="site-header">
    <!-- container -->
    <div class="site-header-container">
      <!-- logo -->
      <div class="logo">Logo</div>
      <!-- hamburger-button -->
      <button class="hamburger-btn" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <!-- nav link -->
      <nav class="nav-menu" :class="{ 'is-open': isMobileMenuOpen }">
        <ul>
          <RouterLink to="/" class="nav-link" @click="closeMenu"
            >Home</RouterLink
          >
        </ul>
        <ul>
          <RouterLink to="/book" class="nav-link" @click="closeMenu"
            >Book</RouterLink
          >
        </ul>
        <ul>
          <RouterLink to="/about" class="nav-link" @click="closeMenu"
            >About</RouterLink
          >
        </ul>
        <ul>
          <RouterLink to="/contact" class="nav-link" @click="closeMenu"
            >Contact</RouterLink
          >
        </ul>
      </nav>

      <div class="header-right">
        <el-icon :size="20"><Search /></el-icon>
        <div>
          <RouterLink to="/shoppingcart" class="header-right-link"
            ><el-icon :size="25"><ShoppingCart /></el-icon></RouterLink
          >
        </div>
        <el-button round
          ><RouterLink to="/signin" class="header-right-link"
            >SignIn</RouterLink
          ></el-button
        >
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";

const isMobileMenuOpen = ref(false);

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
.site-header {
  width: 100%;
  height: 60px;
  border-bottom: 1px solid #0d0f0e;
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 2rem;
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1a1a1a;
  text-decoration: none;
  min-width: 180px;
}

.logo-img {
  height: 60px;
  width: auto;
  display: block;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.nav-menu ul {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 2rem;
  list-style: none;
  align-items: center;
  border-right: 1px solid #191b1a;
}

.nav-link,
.header-right-link {
  cursor: pointer;
  color: #1a1a1a;
  text-decoration: none;
}

.nav-menu ul:last-child {
  border-right: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #42b883;
}

.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 26px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.bar {
  width: 100%;
  height: 2px;
  background-color: #1a1a1a;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  min-width: 180px;
}

@media (max-width: 768px) {
  .site-header-container {
    position: relative;
  }

  .hamburger-btn {
    display: flex;
    position: absolute;
    left: 1.5rem;
  }

  .logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 0 1rem 0;
    gap: 1rem;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: none;
  }

  .nav-menu ul {
    border-right: none;
  }
  .nav-menu.is-open {
    display: flex;
  }

  .header-right {
    position: absolute;
    right: 0.5rem;
    min-width: auto;
  }
}
</style>
