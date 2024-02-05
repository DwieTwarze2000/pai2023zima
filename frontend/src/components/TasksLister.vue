<template>
  <div>
    <v-card>
      <v-card-title>Tasks</v-card-title>
      <v-card-subtitle>
        Filtering
        <v-row>
          <v-col>
            <v-text-field v-model="search" @input="retrieve" variant="solo" label="Match name or description"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="project"
              label="Project"
              multiple
              chips
              @update:modelValue="retrieve"
              :items="projects.map((project) => ({ value: project._id, title: project.name }))"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <span>Show not finished</span>
            <v-checkbox v-model="showNotFinished" @update:modelValue="retrieve"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <div>Limit</div>
            <v-slider density="compact" v-model="limit" min="5" max="100" step="5" thumb-label @update:modelValue="retrieve"></v-slider>
          </v-col>
          <v-col cols="1">
            <v-btn variant="elevated" color="success" @click="add">Add</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card-text>
        <v-table density="compact" hover>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Start date</th>
              <th class="text-left">End date</th>
              <th class="text-left">Project</th>
              <th class="text-left">People</th>
              <th v-if="showNotFinished">Finish Task</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(task, index) in tasks" :key="index" @click="click(task)">
              <td>{{ task.name }}</td>
              <td>{{ task.description }}</td>
              <td>{{ new Date(task.startDate).toLocaleDateString() }}</td>
              <td>{{ task.endDate ? new Date(task.endDate).toLocaleDateString() : '-' }}</td>
              <td>
                <v-chip :color="task.project.color">{{ task.project.shortcut }}</v-chip>
              </td>
              <td>
                <v-chip v-for="(person, pindex) in task.people" :key="pindex" :color="'#32612D'">
                  {{ person.firstName }} {{ person.lastName }}
                </v-chip>
              </td>
              <td v-if="showNotFinished" class="test">
                <v-btn icon @click.stop="finish(task)">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr>
              <td colspan="6" v-if="showNotFinished"></td>
              <td v-if="showNotFinished" class="finish-all" @click="finishAll">Finish All</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="editor" width="50%">
      <TasksEditor :id="id" @dataChanged="retrieve" @cancel="cancel" @dataAccessFailed="onDataAccessFailed" />
    </v-dialog>
    <v-snackbar v-model="dataAccessError" color="error" timeout="3000">{{ dataAccessErrorMsg }}</v-snackbar>
  </div>
</template>
<script>
import TasksEditor from './TasksEditor.vue';

export default {
  name: 'TasksLister',
  components: { TasksEditor },
  methods: {
    add() {
      this.id = null;
      this.editor = true;
    },
    cancel() {
      this.id = null;
      this.editor = false;
    },
    click(row) {
      this.id = row._id;
      this.editor = true;
    },
    retrieve() {
      this.id = null;
      this.editor = false;
      fetch(
        'http://localhost:8000/tasks?search=' +
          this.search +
          '&limit=' +
          this.limit +
          '&project=' +
          JSON.stringify(this.project) +
          '&showNotFinished=' +
          this.showNotFinished,
        {
          method: 'GET',
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.tasks = data;
        })
        .catch((err) => this.onDataAccessFailed(err.message));
    },
    onDataAccessFailed(data) {
      this.dataAccessErrorMsg = data;
      this.dataAccessError = true;
    },
    finish(task) {
      fetch('http://localhost:8000/tasks?_id=' + task._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endDate: new Date().toISOString(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          this.retrieve();
        })
        .catch((err) => this.onDataAccessFailed(err.message));
    },
    finishAll() {
      this.tasks.forEach((task) => {
        this.finish(task);
      });
      this.showNotFinished = false;
      this.retrieve();
    },
  },
  data() {
    return {
      editor: false,
      id: null,
      search: '',
      limit: 10,
      project: [],
      projects: [],
      tasks: [],
      dataAccessError: false,
      dataAccessErrorMsg: '',
      showNotFinished: false,
    };
  },
  mounted() {
    this.retrieve();
    fetch('/project', { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        this.projects = data;
      })
      .catch((err) => this.onDataAccessFailed(err.message));
  },
};
</script>
<style scoped>
.finish-all {
  text-align: left;
  cursor: pointer;
  color: green;
  margin-top: 10px;
}
</style>
