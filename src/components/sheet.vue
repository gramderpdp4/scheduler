<template>
    <f7-sheet :style="style" v-model:opened="isOpened" class="sheet-modal-events">
        <f7-toolbar>
            <div class="left margin-left">
                {{ date }}
            </div>
            <div class="right"></div>
        </f7-toolbar>
        <f7-page-content>
            <f7-block>
                <div v-if="$props.result == null">
                    <p class="text-align-center">Nada por aqui</p>
                </div>
                <div v-else>
                    <div class="timeline">
                        <div class="timeline-item" v-for="(item, index) in $props.result">
                            <div class="timeline-item-date">{{ item.time }}</div>
                            <div class="timeline-item-divider"></div>
                            <div class="timeline-item-content">
                            <div class="timeline-item-inner">{{ item.type }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </f7-block>
        </f7-page-content>
        <f7-fab @click="newEvent" position="right-bottom" text="Novo evento"></f7-fab>
    </f7-sheet>
</template>
<script>
    import { f7 } from 'framework7-vue';
    import { $ } from 'dom7';

    export default {
        data() {
            return {
                isOpened: true,
                style: {
                    backgroundColor: 'var(--f7-toolbar-bg-color, var(--f7-bars-bg-color))',
                    borderRadius: '0px'
                }
            }
        },

        methods: {
            newEvent() {
                f7.view.main.router.navigate(`/new-event/${this.$props.date}`)
            }
        },

        props: ['date', 'result'],

        watch: {
            result: function(currentValue, beforeValue) {
               if ( currentValue ) $(".sheet-modal-events").addClass("sheet-expandable")
               else $(".sheet-modal-events").removeClass("sheet-expandable")
            }
        }
    }
</script>
<style scoped>
    .sheet-expandable {
        height: 60vh;
    }

    .sheet-modal-events {
        transition: height 0.3s ease-out
    }
</style>