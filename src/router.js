/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import Router from 'vue-router';
import * as types from './store/mutation-types';

Vue.use(Router);

export function createRouter({routes = []}) {

    const router = new Router({
        mode: 'history',
        base: '/',
        routes: [
            ...routes,
            {
                path: '*',
                beforeEnter(to) {
                    window.location.href = to.fullPath;
                }
            }
        ]
    });

    /**
     * 切换动画名称
     *
     * @type {string}
     * @const
     */
    const SLIDE_LEFT = 'slide-left';

    /**
     * 切换动画名称
     *
     * @type {string}
     * @const
     */
    const SLIDE_RIGHT = 'slide-right';

    router.beforeEach((to, from, next) => {
        if (router.app.$store) {
            // 如果不需要切换动画，直接返回
            if (router.app.$store.state.appShell.needPageTransition) {
                // 判断当前是前进还是后退，添加不同的动画效果
                let pageTransitionName = isForward(to, from) ? SLIDE_LEFT : SLIDE_RIGHT;
                router.app.$store.commit(`appShell/${types.SET_PAGE_TRANSITION_NAME}`, {pageTransitionName});
            }
        }
        next();
    });

    return router;

}

/**
 * to 如果在这个列表中，始终采用从左到右的滑动效果，首页比较适合用这种方式
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_BACK_PAGE = ['home'];

/**
 * to 如果在这个列表中，始终采用从右到左的滑动效果
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_FORWARD_PAGE = ['search'];

/**
 * 历史记录，记录访问过的页面的 fullPath
 *
 * @type {Array.<string>}
 * @const
 */
const HISTORY_STACK = [];

/**
 * 判断当前是否是前进，true 表示是前进，否则是回退
 *
 * @param {Object} to 目标 route
 * @param {Object} from 源 route
 * @return {boolean} 是否表示返回
 */
function isForward(to, from) {
    let res = true;

    // to 如果在这个列表中，始终认为是后退
    if (to.name && ALWAYS_BACK_PAGE.indexOf(to.name) !== -1) {
        // 清空历史
        HISTORY_STACK.length = 0;
        res = false;
    }
    else if (from.name && ALWAYS_BACK_PAGE.indexOf(from.name) !== -1) {
        // 如果是从 ALWAYS_BACK_PAGE 过来的，那么永远都是前进
        HISTORY_STACK.push(to.fullPath);
    }
    else if (to.name && ALWAYS_FORWARD_PAGE.indexOf(to.name) !== -1) {
        // to 如果在这个列表中，始终认为是前进
        HISTORY_STACK.push(to.fullPath);
    }
    else {
        // 根据 fullPath 判断当前页面是否访问过，如果访问过，则属于返回
        let index = HISTORY_STACK.indexOf(to.fullPath);
        if (index !== -1) {
            HISTORY_STACK.length = index + 1;
            res = false;
        }
        else {
            // 将 to.fullPath 加到栈顶
            HISTORY_STACK.push(to.fullPath);
        }
    }

    return res;
}
