<template>
  <div :class="['login-wrapper', ['', 'login-form-right', 'login-form-left'][direction]]">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      class="login-form ele-bg-white"
      size="large"
      @keyup.enter.native="doSubmit">
      <h4>{{ $t('login.title') }}</h4>
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :placeholder="$t('login.username')"
          clearable
          prefix-icon="el-icon-user"/>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          :placeholder="$t('login.password')"
          prefix-icon="el-icon-lock"
          show-password/>
      </el-form-item>
      <el-form-item prop="captcha">
        <div class="login-input-group">
          <el-input
            v-model="form.captcha"
            :placeholder="$t('login.captcha')"
            clearable
            prefix-icon="el-icon-_vercode"/>
          <img
            v-if="captcha"
            :src="captcha"
            alt=""
            class="login-captcha"
            @click="changeCode"/>
        </div>
      </el-form-item>
      <div class="el-form-item">
        <el-checkbox v-model="form.remember">{{ $t('login.remember') }}</el-checkbox>
      </div>
      <div class="el-form-item">
        <el-button
          :loading="loading"
          class="login-btn"
          size="large"
          type="primary"
          @click="doSubmit">
          {{ loading ? $t('login.loading') : $t('login.login') }}
        </el-button>
      </div>
    </el-form>
    <div class="login-copyright">
      Copyright © 2025 www.chouy.xyz All rights reserved. &nbsp;
      备案号 <a href="https://beian.miit.gov.cn/" target="_blank">浙ICP备20021765号-1</a>&nbsp;
      <img src="@/assets/beian.png"  alt="备案" /><a href="https://beian.miit.gov.cn/" target="_blank">浙公网安备 33011002014800号</a>
    </div>
    <!-- 多语言切换 -->
    <div style="position: absolute;right: 30px;top: 20px;">
      <el-dropdown placement="bottom" @command="changeLanguage">
        <i class="el-icon-_language" style="font-size: 22px;color: #fff;cursor: pointer;"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="en">
            <span :class="{'ele-text-primary': language === 'en'}">English</span>
          </el-dropdown-item>
          <el-dropdown-item command="zh_CN">
            <span :class="{'ele-text-primary': language === 'zh_CN'}">简体中文</span>
          </el-dropdown-item>
          <el-dropdown-item command="zh_TW">
            <span :class="{'ele-text-primary': language === 'zh_TW'}">繁體中文</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import setting from '@/config/setting';

export default {
  name: 'Login',
  data() {
    return {
      // 登录框方向, 0居中, 1居右, 2居左
      direction: 0,
      // 加载状态
      loading: false,
      // 表单数据
      form: {
        username: '',
        password: '',
        captcha: '',
        captcha_key: '',
        remember: true
      },
      // 验证码base64数据
      captcha: ''
    };
  },
  computed: {
    // 表单验证规则
    rules() {
      return {
        username: [
          {required: true, message: this.$t('login.username'), type: 'string', trigger: 'blur'}
        ],
        password: [
          {required: true, message: this.$t('login.password'), type: 'string', trigger: 'blur'}
        ],
        captcha: [
          {required: true, message: this.$t('login.captcha'), type: 'string', trigger: 'blur'}
        ]
      };
    },
    // 当前语言
    language() {
      return this.$i18n.locale;
    }
  },
  mounted() {
    if (setting.takeToken()) {
      this.goHome();
    } else {
      this.changeCode();
    }
  },
  methods: {
    /* 提交 */
    doSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        // let formData = new FormData();
        // for (let key in this.form) {
        //   formData.append(key, this.form[key]);
        // }
        this.$http.post('/user/login', this.form).then((res) => {
          if (res.data.code === 0) {
            this.$message.success('登录成功');
            this.$store.dispatch('user/setToken', {
              token: 'Bearer ' + res.data.data.access_token,
              remember: this.form.remember
            }).then(() => {
              this.goHome();
            });
          } else {
            this.$message.error(res.data.data ? res.data.data.message : res.data.msg);
            // 重新刷新验证码
            this.changeCode()
          }
        }).catch(err => {
          let res = err.response
          this.$message.error(res.data.data.message);
          // 重新刷新验证码
          this.changeCode()
        }).finally(() => {
          this.loading = false;
        });
      });
    },
    /* 跳转到首页 */
    goHome() {
      const query = this.$route.query;
      const path = query && query.from ? query.from : '/';
      this.$router.push(path).catch(() => {
      });
    },
    /* 更换图形验证码 */
    changeCode() {
      // 这里演示的验证码是后端返回base64格式的形式, 如果后端地址直接是图片请参考忘记密码页面
      this.$http.get('/captcha').then(res => {
        if (res.data.code === 0) {
          this.captcha = res.data.data.captcha_image_content;
          this.form.captcha_key = res.data.data.captcha_key;
          this.$refs.form.clearValidate();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((e) => {
        this.$message.error(e.message);
      });
    },
    /* 切换语言 */
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      localStorage.setItem('i18n-lang', lang);
    }
  }
}
</script>

<style scoped>
/* 背景 */
.login-wrapper {
  padding: 50px 20px;
  position: relative;
  box-sizing: border-box;
  background-image: url("../../assets/bg-login.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
}

.login-wrapper:before {
  content: "";
  background-color: rgba(0, 0, 0, .2);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 卡片 */
.login-form {
  margin: 0 auto;
  width: 380px;
  max-width: 100%;
  padding: 25px 30px;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  border-radius: 4px;
  z-index: 2;
}

.login-form-right .login-form {
  margin: 0 15% 0 auto;
}

.login-form-left .login-form {
  margin: 0 auto 0 15%;
}

.login-form h4 {
  text-align: center;
  margin: 0 0 25px 0;
}

.login-form > .el-form-item {
  margin-bottom: 25px;
}

/* 验证码 */
.login-input-group {
  display: flex;
  align-items: center;
}

.login-input-group ::v-deep .el-input {
  flex: 1;
}

.login-captcha {
  height: 38px;
  width: 102px;
  margin-left: 10px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  text-align: center;
  cursor: pointer;
}

.login-captcha:hover {
  opacity: .75;
}

.login-btn {
  display: block;
  width: 100%;
}

/* 第三方登录图标 */
.login-oauth-icon {
  color: #FFF;
  padding: 5px;
  margin: 0 10px;
  font-size: 18px;
  border-radius: 50%;
  cursor: pointer;
}

/* 底部版权 */
.login-copyright {
  color: #eee;
  padding-top: 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* 响应式 */
@media screen and (min-height: 550px) {
  .login-form {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: -220px;
  }

  .login-form-right .login-form,
  .login-form-left .login-form {
    left: auto;
    right: 15%;
    transform: translateX(0);
    margin: -220px auto auto auto;
  }

  .login-form-left .login-form {
    right: auto;
    left: 15%;
  }

  .login-copyright {
    position: absolute;
    bottom: 20px;
    right: 0;
    left: 0;
  }
}

@media screen and (max-width: 768px) {
  .login-form-right .login-form,
  .login-form-left .login-form {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    margin-right: auto;
  }
}
</style>
