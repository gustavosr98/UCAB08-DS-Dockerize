<template>
  <v-content>
    <navbar :navigationModules="navigationModules"></navbar>
    <slot></slot>
  </v-content>
</template>

<script>
import Navbar from "@/components/General/Navigation/Navbar";
import adminRoutes from "@/router/adminRoutes";

export default {
  name: "admin-layout",
  components: {
    navbar: Navbar,
  },
  data() {
    return {
      navigationModules: [
        {
          name: "navbar.dashboard",
          mdiIcon: "mdi-home",
          route: adminRoutes.DASHBOARD,
        },
        {
          name: "navbar.user",
          mdiIcon: "mdi-account-multiple",
          route: adminRoutes.USER_LIST,
        },
        {
          name: "navbar.bankAccount",
          mdiIcon: "mdi-bank",
          route: adminRoutes.BANK_ACCOUNT_LIST,
        },
        {
          name: "navbar.transaction",
          mdiIcon: "mdi-repeat",
          route: adminRoutes.TRANSACTION_LIST,
        },
        {
          name: "navbar.platformConfig",
          mdiIcon: "mdi-settings",
          route: adminRoutes.PLATFORM_CONFIG,
        },
      ],
    };
  },
};
</script>
