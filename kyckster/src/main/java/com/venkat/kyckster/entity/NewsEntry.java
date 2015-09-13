package com.venkat.kyckster.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.venkat.kyckster.JsonViews;

import org.codehaus.jackson.map.annotate.JsonView;



@javax.persistence.Entity
@Table(name="NewsEntry")
public class NewsEntry implements Entity
{

	@Id
	@GeneratedValue
	private Long id;

	@Column
	private Date systemDate;

	@Column
	private String content;


	public NewsEntry()
	{
		this.systemDate = new Date();
	}


	@JsonView(JsonViews.Admin.class)
	public Long getId()
	{
		return this.id;
	}


	@JsonView(JsonViews.User.class)
	public Date getDate()
	{
		return this.systemDate;
	}


	public void setDate(Date systemDate)
	{
		this.systemDate = systemDate;
	}


	@JsonView(JsonViews.User.class)
	public String getContent()
	{
		return this.content;
	}


	public void setContent(String content)
	{
		this.content = content;
	}


	@Override
	public String toString()
	{
		return String.format("NewsEntry[%d, %s]", this.id, this.content);
	}

}