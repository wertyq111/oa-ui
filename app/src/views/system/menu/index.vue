<template>
  <div class="ele-body">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form
        :model="where"
        class="ele-form-search"
        label-width="77px"
        @keyup.enter.native="reload"
        @submit.native.prevent>
        <el-row :gutter="15">
          <el-col :lg="6" :md="12">
            <el-form-item label="菜单名称:">
              <el-input
                v-model="where.title"
                clearable
                placeholder="请输入菜单名称"/>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12">
            <div class="ele-form-actions">
              <el-button
                class="ele-btn-icon"
                icon="el-icon-search"
                type="primary"
                @click="reload">查询
              </el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据表格 -->
      <ele-pro-table
        ref="table"
        :columns="columns"
        :datasource="url"
        :need-page="false"
        :parse-data="parseData"
        :where="where"
        default-expand-all
        height="calc(100vh - 270px)"
        row-key="id">
        <!-- 表头工具栏 -->
        <template slot="toolbar">
          <el-button
            class="ele-btn-icon"
            icon="el-icon-plus"
            size="small"
            type="primary"
            @click="openEdit(null)">添加
          </el-button>
          <el-button
            class="ele-btn-icon"
            size="small"
            @click="expandAll">展开全部
          </el-button>
          <el-button
            class="ele-btn-icon"
            size="small"
            @click="foldAll">折叠全部
          </el-button>
        </template>
        <!-- 标题列 -->
        <template slot="title" slot-scope="{row}">
          <i :class="row.icon"></i> {{ row.title }}
        </template>
        <!-- 类型列 -->
        <template slot="type" slot-scope="{row}">
          <el-tag
            v-if="isUrl(row.path)"
            size="mini"
            type="warning">外链
          </el-tag>
          <el-tag
            v-else-if="isUrl(row.component)"
            size="mini"
            type="success">内链
          </el-tag>
          <el-tag
            v-else
            :type="['primary', 'info'][row.type]"
            size="mini">
            {{ ['菜单', '按钮'][row.type] }}
          </el-tag>
        </template>
        <!-- 状态列 -->
        <template slot="status" slot-scope="{row}">
          <ele-dot :ripple="row.status===0" :text="['禁用','正常'][row.status]"
                   :type="['danger', 'success'][row.status]"/>
        </template>
        <!-- 操作列 -->
        <template slot="action" slot-scope="{row}">
          <el-link
            v-if="permission.includes('sys:menu:addz')"
            :underline="false"
            icon="el-icon-plus"
            type="primary"
            @click="openEdit(null, row.id)">添加
          </el-link>
          <el-link
            v-if="permission.includes('sys:menu:edit')"
            :underline="false"
            icon="el-icon-edit"
            type="primary"
            @click="openEdit(row)">修改
          </el-link>
          <el-popconfirm
            class="ele-action"
            title="确定要删除吗？"
            @confirm="remove(row)">
            <el-link
              v-if="permission.includes('sys:menu:delete')"
              slot="reference"
              :underline="false"
              icon="el-icon-delete"
              type="danger">删除
            </el-link>
          </el-popconfirm>
        </template>
      </ele-pro-table>
    </el-card>
    <!-- 编辑弹窗 -->
    <menu-edit
      :data="current"
      :menu-list="menuList"
      :visible.sync="showEdit"
      @done="reload"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import MenuEdit from './menu-edit.vue';

export default {
  name: 'SystemMenu',
  components: {MenuEdit},
  computed: {
    ...mapGetters(["permission"]),
  },
  data() {
    return {
      // 表格数据接口
      url: '/menu/index',
      // 表格列配置
      columns: [
        {
          columnKey: 'index',
          type: 'index',
          width: 45,
          align: 'center',
          showOverflowTooltip: true,
          fixed: "left"
        },
        {
          prop: 'title',
          label: '菜单名称',
          showOverflowTooltip: true,
          minWidth: 200,
          slot: 'title',
        },
        {
          prop: 'type',
          label: '菜单类型',
          align: 'center',
          showOverflowTooltip: true,
          width: 100,
          slot: 'type'
        },
        {
          prop: 'path',
          label: '路由地址',
          showOverflowTooltip: true,
          align: 'center',
          minWidth: 200
        },
        {
          prop: 'component',
          label: '组件路径',
          showOverflowTooltip: true,
          align: 'center',
          minWidth: 150
        },
        {
          prop: 'permission',
          label: '权限标识',
          showOverflowTooltip: true,
          align: 'center',
          minWidth: 150
        },
        {
          prop: 'sort',
          label: '排序',
          align: 'center',
          showOverflowTooltip: true,
          sortable: 'custom',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          showOverflowTooltip: true,
          width: 100,
          slot: 'status',
        },
        {
          columnKey: 'action',
          label: '操作',
          width: 190,
          align: 'center',
          resizable: false,
          slot: 'action',
          fixed: "right"
        }
      ],
      // 表格搜索条件
      where: {},
      // 表格选中数据
      selection: [],
      // 当前编辑数据
      current: null,
      // 是否显示编辑弹窗
      showEdit: false,
      // 全部菜单数据
      menuList: []
    };
  },
  methods: {
    /* 解析接口返回数据 */
    parseData(res) {
      res.data = this.$util.toTreeData(res.data, 'id', 'pid');
      this.menuList = res.data;
      this.$nextTick(() => {
        this.foldAll()
      })
      return res;
    },
    /* 刷新表格 */
    reload() {
      this.$refs.table.reload({where: this.where});
    },
    /* 重置搜索 */
    reset() {
      this.where = {};
      this.reload();
    },
    /* 显示编辑 */
    openEdit(row, pid) {
      if (!row) {
        // 添加
        this.current = Object.assign({
          type: 0,
          hide: 0,
          pid: pid
        }, row);
        this.showEdit = true;
      } else {
        // 编辑
        this.$http.get(`/menu/info/${row.id}`, {params: {include: ['children']}}).then(res => {
          if (res.data.code === 0) {
            this.current = res.data.data;
            this.showEdit = true;
          } else {
            this.$message.error(res.data.msg);
          }
        }).catch(e => {
          this.$message.error(e.message);
        });
      }
    },
    /* 删除 */
    remove(row) {
      // if (row.children && row.children.length > 0) {
      //   this.$message.error('请先删除子节点');
      //   return;
      // }
      const loading = this.$loading({lock: true});
      this.$http.delete(`/menu/${row.id}`).then(res => {
        loading.close();
        if (res.data.code === 0) {
          this.$message.success(res.data.msg);
          this.reload();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        loading.close();
        this.$message.error(e.message);
      });
    },
    /* 展开全部 */
    expandAll() {
      this.$refs.table.data.forEach(d => {
        this.$refs.table.toggleRowExpansion(d, true);
      });
    },
    /* 折叠全部 */
    foldAll() {
      this.$refs.table.data.forEach(d => {
        this.$refs.table.toggleRowExpansion(d, false);
      });
    },
    /* 判断是否是网址 */
    isUrl(url) {
      return url && (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('://'));
    }
  }
}
</script>

<style scoped>
</style>
