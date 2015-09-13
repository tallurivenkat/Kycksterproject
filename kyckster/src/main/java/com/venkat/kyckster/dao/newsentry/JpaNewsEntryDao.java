package com.venkat.kyckster.dao.newsentry;

import java.util.List;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import com.venkat.kyckster.dao.JpaDao;
import com.venkat.kyckster.entity.NewsEntry;

import org.springframework.transaction.annotation.Transactional;


/**
 * JPA Implementation of a {@link NewsEntryDao}.
 * 
 * @author Venkat Talluri  <tallurivenkat@gmail.com>
 */
public class JpaNewsEntryDao extends JpaDao<NewsEntry, Long> implements NewsEntryDao
{

	public JpaNewsEntryDao()
	{
		super(NewsEntry.class);
	}


	@Override
	@Transactional(readOnly = true)
	public List<NewsEntry> findAll()
	{
		final CriteriaBuilder builder = this.getEntityManager().getCriteriaBuilder();
		final CriteriaQuery<NewsEntry> criteriaQuery = builder.createQuery(NewsEntry.class);

		Root<NewsEntry> root = criteriaQuery.from(NewsEntry.class);
		criteriaQuery.orderBy(builder.desc(root.get("systemDate")));

		TypedQuery<NewsEntry> typedQuery = this.getEntityManager().createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

}
