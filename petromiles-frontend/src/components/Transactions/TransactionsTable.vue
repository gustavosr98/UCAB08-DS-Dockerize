<template>
  <div>
    <date-range-picker @filterData="filterData" :dataToFilter="transactions" />
    <datatable
      :title="title"
      :headers="headers"
      :fetchedData="mungedData"
      linkTo="/transaction-details"
    />
  </div>
</template>

<script>
import Datatable from "@/components/General/Datatable/Datatable";
import DateRangePicker from "@/components/Transactions/DateRangePicker";
import Transaction from "@/constants/transaction";
import PlatformInterest from "@/constants/platformInterest";

export default {
  name: "transactions-table",
  components: {
    Datatable,
    "date-range-picker": DateRangePicker,
  },
  data() {
    return {
      transactions: [],
      fetchedData: [],
    };
  },
  async mounted() {
    this.fetchedData = await this.$http.get("/transaction");
    this.transactions = this.fetchedData;
  },

  methods: {
    filterData(filteredData) {
      this.fetchedData = filteredData;
    },
    getTransactionAmount(transaction) {
      if (transaction.type === Transaction.BANK_ACCOUNT_VERIFICATION) {
        return transaction.transactionInterest[0].platformInterest.amount;
      }

      return (
        parseInt(transaction.rawAmount) / 100 +
        parseInt(transaction.totalAmountWithInterest) / 100
      ).toFixed(3);
    },
  },
  computed: {
    title() {
      return this.$tc("navbar.transaction", 1);
    },
    headers() {
      return [
        {
          text: this.$tc("common.code"),
          align: "center",
          value: "idTransaction",
        },
        {
          text: this.$tc("common.date"),
          align: "center",
          value: "initialDate",
        },
        {
          text: this.$tc("common.total", 0) + " ( $ )",
          align: "center",
          value: "amount",
        },
        {
          text: this.$tc("common.type"),
          align: "center",
          value: "type",
        },
        {
          text: this.$tc("common.state"),
          align: "center",
          value: "state",
        },
        {
          text: this.$tc("common.seeMore"),
          align: "center",
          value: "details",
        },
      ];
    },
    mungedData() {
      return this.fetchedData.map(data => {
        const state = {
          name: data.stateTransaction[0].state.name,
          translated: this.$tc(
            `state-name.${data.stateTransaction[0].state.name}`
          ),
        };

        return {
          ...data,
          state,
          id: data.idTransaction,
          amount: this.getTransactionAmount(data),
          type: this.$tc(`transaction-type.${data.type}`),
        };
      });
    },
  },
};
</script>
