import React, { Component } from 'react'
import { connect } from 'react-redux'
import Router from 'next/router'
import cookie from 'cookie'
import reduxPage from '@reduxPage'
import { http } from '@utils'
import { getUser } from '@actions'
import {
  Layout,
  ErrorFetch,
} from '@components'

const util = require('util')
@reduxPage
@connect(({ user }) => ({ user }))

export default class extends Component {
  static async getInitialProps(ctx) {
    // err req res pathname query asPath isServer
    const {
      store, req, res, query,
    } = ctx

    try {
      let allCookie
      let token
      if (req) {
        allCookie = req.headers.cookie
        token = cookie.parse(String(allCookie)).userToken
      } else {
        allCookie = document.cookie
        token = cookie.parse(String(allCookie)).userToken
      }

      // 检测token是否有效
      const response = await http.get('user_info', { token })
      if (response.code === 200 && response.success) {
        store.dispatch(getUser(response.data.user))
      } else {
        if (res) {
          res.writeHead(301, {
            Location: '/login',
          })
          res.end()
          res.finished = true
        }
        if (!res) {
          Router.replace('/3-me/2-login', '/login')
        }
      }
    } catch (error) {
      const err = util.inspect(error)
      return { err }
    }
    return null
  }
  state = {
    dataParam: null,
  }
  componentDidMount() {
    if (this.props.user.phone) {
      this.setParam()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.user.phone && nextProps.user.phone) {
      this.setParam()
    }
  }
  setParam = () => {
    const docCookie = document.cookie
    const token = cookie.parse(String(docCookie)).userToken
    this.setState(() => ({ dataParam: { token } }))
  }
  render() {
    const { err } = this.props
    if (err) {
      return <ErrorFetch err={err} />
    }
    return (
      <Layout title="我的收藏">

      </Layout>
    )
  }
}
