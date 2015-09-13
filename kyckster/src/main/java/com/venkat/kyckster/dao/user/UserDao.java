package com.venkat.kyckster.dao.user;

import com.venkat.kyckster.dao.Dao;
import com.venkat.kyckster.entity.User;

import org.springframework.security.core.userdetails.UserDetailsService;


public interface UserDao extends Dao<User, Long>, UserDetailsService
{

	User findByName(String name);

}