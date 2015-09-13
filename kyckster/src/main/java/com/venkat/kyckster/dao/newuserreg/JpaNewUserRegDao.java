package com.venkat.kyckster.dao.newuserreg;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import com.venkat.kyckster.dao.JpaDao;
import com.venkat.kyckster.entity.NewUser;

import org.springframework.transaction.annotation.Transactional;


/**
 * JPA Implementation of a {@link NewUserRegDao}.
 * 
 * @author Venkat Talluri  <tallurivenkat@gmail.com>
 */
public class JpaNewUserRegDao extends JpaDao<NewUser, Long> implements NewUserRegDao
{

	public JpaNewUserRegDao()
	{
		super(NewUser.class);
	}


	@Override
	@Transactional(readOnly = true)
	public List<NewUser> findAll()
	{
		final CriteriaBuilder builder = this.getEntityManager().getCriteriaBuilder();
		final CriteriaQuery<NewUser> criteriaQuery = builder.createQuery(NewUser.class);

		Root<NewUser> root = criteriaQuery.from(NewUser.class);
		criteriaQuery.orderBy(builder.desc(root.get("id")));

		TypedQuery<NewUser> typedQuery = this.getEntityManager().createQuery(criteriaQuery);
		return typedQuery.getResultList();
		
//		ArrayList<NewUser> userList=new ArrayList<NewUser>();
//		
//		return userList;
		
	}

}
