<template>
    <f7-panel left push :opened="opened" @panel:opened="panelOpened" @panel:close="panelClose" close-by-backdrop-click="false" backdrop="false" backdrop-el="false">
        <f7-page>
            <div class="navbar">
                <div class="left d-grid margin-left">
                    <div class="d-flex">
                        <img :src="schedule_icon" />
                        <h1 class="margin-left">Agenda</h1>
                    </div>
                    <p class="signature">André DEV</p>
                </div>
                <div class="title"></div>
                <div class="right"></div>
            </div>
            <f7-block>
                <p> {{ date }}</p>
                <div class="divider"></div>
                <div class="margin-top">
                    <div class="d-grid margin-left" v-if="data == null">
                        <img :src="not_events"/>
                        <p >Nada por aqui</p>
                    </div>
                    <div v-else>
                        <div class="timeline">
                            <TransitionGroup name="list">
                                <div class="timeline-item list-timeline-item" v-for="(item, key) in sortedItems" @mouseenter="(event) => mouseEnter(event, item.type)">
                                    <div class="timeline-item-date">{{ item.time }}</div>
                                    <div class="timeline-item-divider"></div>
                                    <div class="timeline-item-content display-flex">
                                        <div class="timeline-item-inner">{{ item.type }}</div>
                                        <a @click="(event) => removeIndividualEvent(event, key)">
                                            <span class="material-symbols-outlined">
                                                more_vert
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
            </f7-block>

        </f7-page>
        <f7-fab v-if="button_new_event" @click="newEvent" position="left-bottom" text="Novo evento"></f7-fab>
    </f7-panel>
</template>
<script>
import { f7 } from 'framework7-vue';
import schedule_icon from '../assets/schedule.svg'
import { $ } from 'dom7';
import app from '../js/firebase'
import { getDatabase, remove, ref, onValue, off } from 'firebase/database';
import { userId } from '../js/user';
import { opacity } from '../js/opacity';
import moment from 'moment-timezone'
import not_events from '../assets/not-events.svg';

const db = getDatabase(app)

export default {
    data() {
        return {
            opened: true,
            not_events: not_events,
            closeByBackdrop: false,
            schedule_icon: schedule_icon,
            data: null,
            path: null,
            button_new_event: true
        }
    },

    props: {
        date: String,
        american_date: String,
    },

    computed: {
        sortedItems() {
  
            if ( typeof this.data === "object" ) {
                const keys = Object.keys(this.data);

                const obj = {}

                 keys.forEach(key => {
                    const item = this.data[key];

                    obj[key] = item;
                 })

                 const data = Object.entries(obj);

                 const data_sort = data.sort((a, b) => {
                    const time_a_split = a[1].time.split(':'),
                    time_b_split = b[1].time.split(':');

                    const time_a = time_a_split[0].length == 1 ? `0${time_a_split[0]}` : time_a_split[0],
                    time_b = time_b_split[0].length == 1 ? `0${time_b_split[0]}` : time_b_split[0];

                    const formatted_time_a = `${this.american_date} ${time_a}:${time_a_split[1]}`,
                    formatted_time_b = `${this.american_date} ${time_b}:${time_b_split[1]}`;

                    const time_a_moment = moment(formatted_time_a, 'YYYY-MM-DD HH:mm', true),
                    time_b_moment = moment(formatted_time_b, 'YYYY-MM-DD HH:mm', true);

                    if (time_a_moment.isValid() && time_b_moment.isValid()) {

                        return time_b_moment.diff(time_a_moment);
                        
                    } else {
                        
                        return 0;
                    }
                 });
                 
                 const data_new = {}

                 data_sort.forEach(item => {
                    data_new[item[0]] = item[1]
                 })
                
                return data_new
            } 

            return null;
            
        }
    },

    watch: {
        american_date(current, before) {
            this.database()

            const current_day = moment();

            if (current_day.format("YYYY-MM-DD") != current && current_day.isAfter(moment(current, 'YYYY-MM-DD'))) {
                this.button_new_event = false
            } else {
                this.button_new_event = true
            }
        }
    },

    methods: {
        database() {
            const path = ref(db, `events/${userId()}/${this.american_date}`);

            onValue(path, (output) => {
                opacity(false)
                output.exists() ? this.data = output.val() : this.data = null;
            })
        },

        newEvent() {
            f7.view.main.router.navigate(`/new-event/${this.$props.date}`)
        },

        removeIndividualEvent(el, key) {
            const vue = this;

            const parent_timeline = $(el.target).closest('.timeline-item')
            const popover = f7.popover.create({
                targetEl: el.target,
                content: `
                    <div class="popover">
                        <div class="popover-inner">
                            <div class="list no-chevron list-outline-ios list-strong-ios list-dividers-ios">
                                <ul>
                                    <li>
                                        <a class="item-content item-link item-remove" style="color: #d63031">
                                            <div class="item-media">
                                                <span class="material-symbols-outlined">
                                                delete
                                                </span>
                                            </div>
                                            <div class="item-inner">
                                            <div class="item-title">Remover evento</div>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                on: {
                    opened: function() {
                        console.log(parent_timeline)
                        $(".item-remove").click(function(){
                            popover.close()

                            const path = ref(db, `events/${userId()}/${vue.american_date}/${key}`)

                            remove(path)
                            .then(() => f7.toast.create({ position: 'center', text: 'Evento removido', closeTimeout: 2000 }).open() )
                            .catch(() => f7.toast.create({ position: 'center', text: 'Erro ao remover evento', closeTimeout: 2000 }).open() )
                        })
                    }
                }
            }).open()
        },

        panelOpened() {
            
        },

        panelClose() {
            $(document).off("popup:open")
        },

        mouseEnter(el, text) {
            const target = el.target;

            const tooltip = f7.tooltip.create({
                targetEl: target,
                text: text,
                on: {
                    show: () => {
                        const listener = () => {{
                            tooltip.hide()
                            $(document).off("popover:open", listener)
                        }}

                        $(document).on("popover:open", listener)
                    },
                }
            }).show()
        },

        mouseLeave() {

        }
    },

}
</script>
<style scoped>
    .timeline .timeline-item-content a {
        margin-top: 0.4rem;
        color: var(--f7-timeline-divider-color);
        width: 25px;
        height: 25px;
        position: absolute;
        margin-left: 95%;
    }

    .timeline {
        padding-left: 0px;
    }

    .timeline .timeline-item-inner a:hover {
        background-color: red;
        padding: 2rem;
    }
    .list-move,
    .list-enter-active,
    .list-leave-active {
    transition: all 0.5s ease;
    }

    .list-enter-from,
    .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
    }

    .list-leave-active {
    position: absolute;
    }

</style>