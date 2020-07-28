import { WebsocketService } from './../websocket.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {

  modules_list: [];
  current: null;
  meta_id = null;
  server_logs = [];
  job_logs = []
  readiness_status = [];
  ngOnInit(): void {
  }

  reset() {
    this.modules_list = [];
    this.current = null;
    this.server_logs = [];
    this.job_logs = [];
    this.readiness_status = [];
    this.toastr.success('reloaded from server', 'modules');
  }

  constructor(private ws: WebsocketService, private toastr: ToastrService) {
    ws.send("modules", "get");
    ws.getMessages("readiness").subscribe((message) => {

      this.readiness_status[message.server_id] = message.message;
    });

    ws.getMessages("modules").subscribe((message) => {
      if (this.meta_id != message.meta.id) {
        this.reset()

      }
      this.modules_list = message;
      this.meta_id = message.meta.id;
    });
    this.ws.getMessages("notification").subscribe((message) => {
      if (message.type == "info") {
        this.toastr.info(message.message, 'Notifications');
      } else if (message.type == "success") {
        this.toastr.success(message.message, 'Notifications');
      } else if (message.type == "error") {
        this.toastr.error(message.message, 'Notifications');
      } else {
        this.toastr.warning(message.message, 'Notifications');
      }


    });

  }



  loadTerminal(job_id, server_id) {
    this.server_logs[server_id] = this.job_logs[job_id];
  }

  setCurrent(module) {
    this.current = module
  }

  runJob(job_id, server_id, output) {
    this.ws.send("job", {
      job_id: job_id,
      server_id: server_id
    });
    this.ws.getMessages("job").subscribe((message) => {
      if (this.job_logs[message.id] == undefined) {
        this.job_logs[message.id] = ""
      }
      this.job_logs[message.id] += message.output;
      this.server_logs[message.server_id] = this.job_logs[message.id];

    });


  }

  readiness(server_id) {
    return this.readiness_status[server_id];
  }

  getOutput(server_id) {
    return this.server_logs[server_id];
  }


}
