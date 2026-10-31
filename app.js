"use strict";
const KEY = "study-board-v1";
const $ = (selector) => document.querySelector(selector);
const priorities = {high:"重要",medium:"普通",low:"稍后"};
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
let tasks = [];
let filter = "all";
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (Array.isArray(saved)) tasks = saved.filter(t => t && typeof t.id === "string" && typeof t.title === "string" && typeof t.completed === "boolean" && /^\d{4}-\d{2}-\d{2}$/.test(t.due) && Object.hasOwn(priorities,t.priority));
} catch { $("#message").textContent = "无法读取本地记录，当前仍可使用看板。"; }
function save() {
  try {localStorage.setItem(KEY,JSON.stringify(tasks)); $("#message").textContent = "";}
  catch {$("#message").textContent = "浏览器无法保存数据，本次更改仅在当前页面有效。";}
  render();
}
function render() {
  const completed = tasks.filter(t=>t.completed).length;
  $("#total").textContent = tasks.length;
  $("#done").textContent = completed;
  $("#rate").textContent = `${tasks.length ? Math.round(completed/tasks.length*100) : 0}%`;
  const query = $("#search").value.trim().toLowerCase();
  const visible = tasks.filter(t => (filter === "all" || (filter === "completed" ? t.completed : !t.completed)) && t.title.toLowerCase().includes(query)).sort((a,b)=>Number(a.completed)-Number(b.completed)||a.due.localeCompare(b.due));
  $("#tasks").replaceChildren();
  $("#empty").hidden = visible.length > 0;
  $("#empty").textContent = tasks.length ? "没有匹配的任务，试试其他筛选条件。" : "暂时没有任务，给今天添加一个小目标吧。";
  visible.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) li.className = "completed";
    const check = document.createElement("input"); check.type = "checkbox"; check.className = "toggle"; check.checked = task.completed; check.setAttribute("aria-label",`切换任务完成状态：${task.title}`);
    check.addEventListener("change",()=>{task.completed=check.checked;save();});
    const body = document.createElement("div"); body.className = "task-body";
    const title = document.createElement("span"); title.className = "task-title"; title.textContent = task.title;
    const meta = document.createElement("div"); meta.className="task-meta";
    const date = document.createElement("span"); const overdue = !task.completed && task.due < localDate(); date.textContent = `${task.due}${overdue ? " · 已逾期" : ""}`; if(overdue) date.className="overdue";
    const priority = document.createElement("span"); priority.className=`badge ${task.priority}`; priority.textContent=priorities[task.priority];
    meta.append(date,priority);body.append(title,meta);
    const remove = document.createElement("button");remove.type="button";remove.className="delete";remove.textContent="删除";remove.setAttribute("aria-label",`删除任务：${task.title}`);
    remove.addEventListener("click",()=>{if(confirm(`确定删除任务“${task.title}”吗？`)){tasks=tasks.filter(t=>t.id!==task.id);save();}});
    li.append(check,body,remove);$("#tasks").append(li);
  });
}
$("#today").textContent = new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
$("#due").value = localDate();
$("#task-form").addEventListener("submit",event=>{
  event.preventDefault();const title=$("#title").value.trim();
  if(!title){$("#message").textContent="请输入任务名称，不能只填写空格。";return;}
  tasks.push({id:globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,title,due:$("#due").value,priority:$("#priority").value,completed:false});
  $("#title").value="";save();$("#title").focus();
});
document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{
  filter=button.dataset.filter;document.querySelectorAll(".filter").forEach(b=>{b.classList.toggle("active",b===button);b.setAttribute("aria-pressed",String(b===button));});render();
}));
$("#search").addEventListener("input",render);
render();
