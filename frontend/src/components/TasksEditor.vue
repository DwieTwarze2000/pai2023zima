<template>
  <div>
    <v-card>
      <v-card-title>{{ id ? 'Edit' : 'Create' }} tasks</v-card-title>

      <v-card-text>
        <v-form v-model="isTaskValid">
          <v-text-field variant="solo" label="Name" v-model="task.name" :rules="[rules.required]"></v-text-field>
          <v-text-field variant="solo" label="Description" v-model="task.description" :rules="[rules.required]"></v-text-field>

          <v-text-field variant="solo" type="date" label="Start date" v-model="task.startDate" :rules="[rules.validStartDate]"></v-text-field>
          <v-text-field variant="solo" type="date" label="End date" v-model="task.endDate" :rules="[rules.validEndDate]"></v-text-field>

          <v-select
            v-model="task.project"
            label="Project"
            :items="projects.map((project) => ({ value: project._id, title: project.name }))"
          ></v-select>

          <v-select v-if="task.project" v-model="task.people" label="People" multiple chips :items="people"></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" color="success" @click="add" :disabled="!isTaskValid" v-if="!id">Add</v-btn>
        <v-btn variant="elevated" color="success" @click="modify" :disabled="!isTaskValid" v-if="id">Modify</v-btn>
        <v-btn variant="elevated" color="error" @click="remove" v-if="id">Remove</v-btn>
        <v-btn variant="elevated" color="warning" @click="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="confirmation" width="auto">
      <ConfirmationDialog :question="'Are you sure to delete \'' + task.name + '\' ?'" @ok="removeReal" @cancel="confirmation = false" />
    </v-dialog>
  </div>
</template>
<script>
import ConfirmationDialog from './ConfirmationDialog.vue';
import common from '../mixins/common';

export default {
  name: 'TasksEditor',
  props: ['id'],
  components: { ConfirmationDialog },
  emits: ['cancel', 'dataChanged', 'dataAccessFailed'],
  mixins: [common],
  data() {
    return {
      task: {},
      isTaskValid: false,
      rules: {
        required: (value) => !!value || 'Empty value is not allowed.',
        validStartDate: (value) => {
          if (!value) return 'Required.';
          if (this.task.endDate && value > this.task.endDate) return 'Start date must be before end date.';
          return true;
        },
        validEndDate: (value) => {
          if (this.task.startDate && value < this.task.startDate) return 'End date must be after start date.';
          return true;
        },
      },
      projects: [],
      people: [],
      confirmation: false,
      count: 0,
    };
  },
  methods: {
    add() {
      fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.task),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.$emit('dataChanged');
        })
        .catch((err) => this.$emit('dataAccessFailed', err.message));
    },
    getPeopleItems() {
      fetch(`/peopleFromProject?projectId=${this.task.project}`, { method: 'GET' })
        .then((response) => response.json())
        .then((data) => {
          this.people = data.map((person) => ({ value: person._id, title: person.firstName + ' ' + person.lastName }));
          this.count++;
        })
        .catch((err) => this.$emit('dataAccessFailed', err.message));
    },
    cancel() {
      this.$emit('cancel');
    },
    remove() {
      this.confirmation = true;
    },
    removeReal() {
      this.confirmation = false;
      fetch('/tasks?_id=' + this.id, { method: 'DELETE' })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.$emit('dataChanged');
        })
        .catch((err) => this.$emit('dataAccessFailed', err.message));
    },
    modify() {
      fetch('/tasks?_id=' + this.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.task),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.$emit('dataChanged');
        })
        .catch((err) => this.$emit('dataAccessFailed', err.message));
    },
  },
  watch: {
    'task.project': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!this.id || this.count > 0) {
          this.people = [];
          this.task.people = [];
        }
        this.getPeopleItems();
      }
    },
  },
  mounted() {
    fetch('/project', { method: 'GET' })
      .then((response) => response.json())
      .then((data) => (this.projects = data))
      .catch((err) => this.$emit('dataAccessFailed', err.message));

    if (this.id) {
      fetch('/tasks?_id=' + this.id, { method: 'GET' })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.task = data;
        })
        .catch((err) => this.$emit('dataAccessFailed', err.message));
    }
  },
};
</script>
