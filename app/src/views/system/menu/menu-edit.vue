<!-- 编辑弹窗 -->
<template>
  <el-dialog
    :destroy-on-close="true"
    :lock-scroll="false"
    :title="isUpdate?'修改菜单':'添加菜单'"
    :visible="visible"
    custom-class="ele-dialog-form"
    width="750px"
    @update:visible="updateVisible">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="92px"
      @keyup.enter.native="save"
      @submit.native.prevent>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="上级菜单:">
            <treeselect
              v-model="form.pid"
              :defaultExpandLevel="3"
              :normalizer="normalizer"
              :options="menuList"
              placeholder="请选择上级菜单"/>
          </el-form-item>
          <el-form-item label="菜单名称:" prop="title">
            <el-input
              v-model="form.title"
              clearable
              placeholder="请输入菜单名称"/>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="菜单类型:">
            <el-radio-group
              v-model="form.type"
              @change="onMenuTypeChange">
              <el-radio :label="0">菜单</el-radio>
              <el-radio :label="1">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="打开方式:">
            <el-radio-group
              v-model="form.target"
              :disabled="form.type === 1"
              @change="onTargetChange">
              <el-radio :label="0">组件</el-radio>
              <el-radio :label="1">内链</el-radio>
              <el-radio :label="2">外链</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <div style="margin: 6px 0 28px 0;">
        <el-divider/>
      </div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="菜单图标:">
            <ele-icon-picker
              v-model="form.icon"
              :disabled="form.type===1"
              placeholder="请选择菜单图标"/>
          </el-form-item>
          <el-form-item name="path">
            <template slot="label">
              <el-tooltip
                v-if="form.target === 2"
                content="需要以`http://`、`https://`、`//`开头"
                placement="top">
                <i class="el-icon-_question"></i>
              </el-tooltip>
              <span>{{ form.target === 2 ? ' 外链地址:' : ' 路由地址:' }}</span>
            </template>
            <el-input
              v-model="form.path"
              :disabled="form.type===1"
              :placeholder="form.target === 2 ? '请输入外链地址' : '请输入路由地址'"
              clearable/>
          </el-form-item>
          <el-form-item name="component">
            <template slot="label">
              <el-tooltip
                v-if="form.target === 1"
                content="需要以`http://`、`https://`、`//`开头"
                placement="top">
                <i class="el-icon-_question"></i>
              </el-tooltip>
              <span>{{ form.target === 1 ? ' 内链地址:' : ' 组件路径:' }}</span>
            </template>
            <el-input
              v-model="form.component"
              :disabled="form.type === 1 || form.target === 2"
              :placeholder="form.target === 1 ? '请输入内链地址' : '请输入组件路径'"
              clearable/>
          </el-form-item>
          <el-form-item label="状态:">
            <el-radio-group
              v-model="form.status">
              <el-radio :label="1">在用</el-radio>
              <el-radio :label="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="权限标识:">
            <el-input
              v-model="form.permission"
              :disabled="form.type === 0"
              clearable
              placeholder="请输入权限标识"/>
          </el-form-item>
          <el-form-item label="排序号:" prop="sort">
            <el-input-number
              v-model="form.sort"
              :min="0"
              class="ele-fluid ele-text-left"
              controls-position="right"
              placeholder="请输入排序号"/>
          </el-form-item>
          <el-form-item label="是否可见:">
            <el-radio-group
              v-model="form.hide"
              :disabled="form.type === 1">
              <el-radio :label="0">显示</el-radio>
              <el-radio :label="1">隐藏</el-radio>
            </el-radio-group>
            <el-tooltip
              content="选择不可见只注册路由不显示在侧边栏，比如添加页面应该选择不可见"
              placement="top">
              <i class="el-icon-_question" style="vertical-align: middle;margin-left: 8px;"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <!--      <el-form-item v-if="form.type==0" label="权限节点:">-->
      <!--        <el-transfer-->
      <!--          v-model="form.checkedList"-->
      <!--          :data="permissionList"-->
      <!--          :titles="['全部节点', '已赋予节点']"-->
      <!--        ></el-transfer>-->
      <!--      </el-form-item>-->
      <el-form-item label="备注:">
        <el-input
          v-model="form.note"
          :maxlength="200"
          :rows="3"
          clearable
          placeholder="请输入备注"
          type="textarea"/>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button
        :loading="loading"
        type="primary"
        @click="save">保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import EleIconPicker from 'ele-admin/packages/ele-icon-picker';

export default {
  name: 'MenuEdit',
  components: {EleIconPicker, Treeselect},
  props: {
    // 弹窗是否打开
    visible: Boolean,
    // 修改回显的数据
    data: Object,
    // 全部菜单数据
    menuList: Array
  },
  data() {
    return {
      // 表单数据
      form: this.initFormData(this.data),
      // 表单验证规则
      rules: {
        title: [
          {required: true, message: '请输入菜单名称', trigger: 'blur'}
        ],
        sort: [
          {required: true, message: '请输入排序号', trigger: 'blur'}
        ]
      },
      // 提交状态
      loading: false,
      // 是否是修改
      isUpdate: false,
      permissionList: [
        {
          key: 1,
          label: `查询`,
        },
        {
          key: 5,
          label: `添加`,
        },
        {
          key: 10,
          label: `修改`,
        },
        {
          key: 15,
          label: `删除`,
        },
        {
          key: 20,
          label: `详情`,
        },
        {
          key: 25,
          label: `状态`,
        },
        {
          key: 30,
          label: `批量删除`,
        },
        {
          key: 35,
          label: `添加子级`,
        },
        {
          key: 40,
          label: `全部展开`,
        },
        {
          key: 45,
          label: `全部折叠`,
        },
        {
          key: 50,
          label: `导出数据`,
        },
        {
          key: 55,
          label: `导入数据`,
        },
        {
          key: 60,
          label: `分配权限`,
        }
      ],
    };
  },
  watch: {
    data() {
      this.isUpdate = !!(this.data && this.data.id);
      this.form = this.initFormData(this.data);
    }
  },
  methods: {
    /* 下拉树格式化 */
    normalizer(d) {
      return {
        id: d.id,
        label: d.title,
        children: d.children || undefined
      };
    },
    /* 保存编辑 */
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          let url = this.isUpdate ? `/menu/${this.form.id}` : '/menu/add'
          this.$http.post(url,
            Object.assign({}, this.form, {
              pid: this.form.pid || 0,
              target: this.form.target === 2 ? "_blank" : "_self"
            })
          ).then(res => {
            this.loading = false;
            if (res.data.code === 0) {
              this.$message.success(res.data.msg);
              this.updateVisible(false);
              this.$emit('done');
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(e => {
            this.loading = false;
            this.$message.error(e.message);
          });
        } else {
          return false;
        }
      });
    },
    /* 更新visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    },
    /* type选择改变 */
    onMenuTypeChange() {
      if (this.form.type === 0) {
        this.form.permission = null;
      } else {
        this.form.target = 0;
        this.form.icon = null;
        this.form.path = null;
        this.form.component = null;
        this.form.hide = true;
      }
    },
    /* target选择改变 */
    onTargetChange() {
      if (this.form.target === 2) {
        this.form.component = null;
      }
    },
    /* 初始化form数据 */
    initFormData(data) {
      let form = {
        type: 0,
        target: 1,
        hide: 1,
        status: 1,
      };
      if (data) {
        let target = 0;
        if (this.isUrl(data.path)) {
          target = 2;
        } else if (this.isUrl(data.component)) {
          target = 1;
        }
        Object.assign(form, data, {
          pid: data.pid === 0 ? null : data.pid,
          target: target
        });

        // 清空 checkedList 值, 取消所有的已选中的权限节点,这样修改菜单信息就不会影响当前的节点信息.以后节点都需要手动添加
        this.$delete(form, 'checkedList')
      }
      return form;
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
