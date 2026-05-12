<template>
  <div id="app">
    <header>
      <router-link to="/" class="logo">TikTok 营销助手</router-link>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/history">历史</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #f8fafc;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.logo {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}
nav {
  display: flex;
  gap: 20px;
}
nav a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}
nav a:hover,
nav a.router-link-active {
  color: #3b82f6;
}
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px;
}
</style>
