<template>
  <div>
    <v-card>
      <v-card-title>{{ id ? 'Edit' : 'Create'}} tasks</v-card-title>
      
      <v-card-text>
        <v-form v-model="isTaskValid">
          
          <v-text-field variant="solo" label="Name" v-model="task.name" :rules="[rules.required]"></v-text-field>
          <v-text-field variant="solo" label="Description" v-model="task.description" :rules="[rules.required]"></v-text-field>

          <v-text-field variant="solo" type="date" label="Start date" v-model="task.startDate" :rules="[rules.validStartDate]"></v-text-field>
          <v-text-field variant="solo" type="date" label="End date" v-model="task.endDate" :rules="[rules.validEndDate]"></v-text-field>
          
          <v-select v-model="task.project" label="Project" :items="projects.map(project => ({ value: project._id, title: project.name }))"
          @change="getPeopleFromProject" 
          ></v-select>

          <v-select v-if="people" v-model="task.people" label="People" multiple chips :items="people.map(person => ({ value: person._id, name: person.firstName + ' ' + person.lastName }))"></v-select>
        </v-form>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" color="success" @click="add" :disabled="!isTaskValid" v-if="!id">Add</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>

  export default {
    name: 'TasksEditor',
    props: [ 'id' ],
    emits: [ 'cancel', 'dataChanged', 'dataAccessFailed' ],
    methods:{
      add() {
        fetch('/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.task) })
          .then(res => res.json())
          .then(data => {
            if(data.error) throw new Error(data.error)
            this.$emit('dataChanged')
          })
          .catch(err => this.$emit('dataAccessFailed', err.message));
      },
      getPeopleFromProject() {
        console.log('changed');
        fetch(`/peopleFromProject?project=${this.task.project}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => this.people = data)
        .catch(err => this.$emit('dataAccessFailed', err.message))
      }
    },
    data() {
      return {
        task: {},
        isTaskValid: false,
        rules: {
          required: value => !!value || 'Empty value is not allowed.',
          validStartDate: value => {
            if (!value) return 'Required.';
            if (this.task.endDate && value > this.task.endDate) return 'Start date must be before end date.';
            return true;
          },
          validEndDate: value => {
            if (this.task.startDate && value < this.task.startDate) return 'End date must be after start date.';
            return true;
          }
        },
        projects: [],
        people: []
      }
    },
    mounted() {
      fetch('/project', { method: 'GET'})
      .then(response => response.json())
      .then(data => this.projects = data)
      .catch(err => this.$emit('dataAccessFailed', err.message))
    }
  }
</script>