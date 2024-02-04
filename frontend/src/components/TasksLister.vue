<template>
  <!-- <div>Task lister hiho</div> -->
  <div>
    <v-card>
      <v-card-title>Tasks</v-card-title>
      <v-card-subtitle>
        Filtering
        <v-row>
          <v-col>
            <v-text-field v-model="search" variant="solo" label="Match name"></v-text-field>
          </v-col>
          <v-col cols="4">
          </v-col>
          <v-col cols="2">
            <div>Limit</div>
            <v-slider density="compact" v-model="limit" min="5" max="100" step="5" thumb-label></v-slider>
          </v-col>
          <v-col cols="1">
            <v-btn variant="elevated" color="success"
              @click="add">Add</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>
    </v-card>
    <v-dialog v-model="editor" width="50%">
        <TasksEditor :id="id"/>
    </v-dialog>
  </div>
</template>
<script>
import TasksEditor from './TasksEditor.vue'

export default {
  name: 'TasksLister',
  components: { TasksEditor },
  methods: {
    add() {
      this.id = null
      this.editor = true
    }
  },
  data() {
    return {
      editor: false,
      id: null,
      search: '',
      limit: 10
    }
  }
}
</script>