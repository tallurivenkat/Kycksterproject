/**
 * 
 */
package com.venkat.kyckster.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.map.annotate.JsonView;

import com.venkat.kyckster.JsonViews;

/**
 * @author Venkat Talluri
 *
 */
@javax.persistence.Entity
@Table(name="NewUser")
public class NewUser implements Entity {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue
	private Long id;
	@Column 
	private String firstName;
	@Column 
	private String nickName;
	@Column 
	private String lastName;
	@Column 
	private String personalEmailAddress;
	@Column 
	private String workEmailAddress;
	@Column 
	private String gender;
	@Column 
	private String race;
	@Column 
	private Date birthdate;
	@Column 
	private String religion;
	@Column 
	private String passionforReligion; 
	@Column 
	private String politicalParty;
	@Column 
	private String politicalViews;
	@Column 
	private String childName;
	@Column 
	private String child1Birthdate;
	@Column 
	private String child2Relation;
	@Column 
	private String child1School;
	@Column 
	private String child1Sports;
	@Column 
	private String childName2;
	@Column 
	private String child1Relation;
	@Column 
	private String child1Gender;
	
	@JsonView(JsonViews.User.class)
	public String getChild1Gender() {
		return child1Gender;
	}
	public void setChild1Gender(String child1Gender) {
		this.child1Gender = child1Gender;
	}
	@JsonView(JsonViews.User.class)
	public String getChild1Relation() {
		return child1Relation;
	}
	public void setChild1Relation(String child1Relation) {
		this.child1Relation = child1Relation;
	}
	
	
	@JsonView(JsonViews.User.class)
	public String getPoliticalViews() {
		return politicalViews;
	}
	public void setPoliticalViews(String politicalViews) {
		this.politicalViews = politicalViews;
	}
	@JsonView(JsonViews.User.class)
	public String getChildName() {
		return childName;
	}
	public void setChildName(String childName) {
		this.childName = childName;
	}
	@JsonView(JsonViews.User.class)
	public String getChild1Birthdate() {
		return child1Birthdate;
	}
	public void setChild1Birthdate(String child1Birthdate) {
		this.child1Birthdate = child1Birthdate;
	}
	@JsonView(JsonViews.User.class)
	public String getChild2Relation() {
		return child2Relation;
	}
	public void setChild2Relation(String child2Relation) {
		this.child2Relation = child2Relation;
	}
	@JsonView(JsonViews.User.class)
	public String getChild1School() {
		return child1School;
	}
	public void setChild1School(String child1School) {
		this.child1School = child1School;
	}
	@JsonView(JsonViews.User.class)
	public String getChild1Sports() {
		return child1Sports;
	}
	public void setChild1Sports(String child1Sports) {
		this.child1Sports = child1Sports;
	}
	@JsonView(JsonViews.User.class)
	public String getChildName2() {
		return childName2;
	}
	public void setChildName2(String childName2) {
		this.childName2 = childName2;
	}
	@JsonView(JsonViews.User.class)
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	@JsonView(JsonViews.User.class)
	public String getFirstName() {
		return firstName;
	}
	
	@JsonView(JsonViews.User.class)
	public String getNickname() {
		return nickName;
	}
	
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	@JsonView(JsonViews.User.class)
	public String getLastName() {
		return lastName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	@JsonView(JsonViews.User.class)
	public String getPersonalEmailAddress() {
		return personalEmailAddress;
	}
	public void setPersonalEmailAddress(String personalEmailAddress) {
		this.personalEmailAddress = personalEmailAddress;
	}
	@JsonView(JsonViews.User.class)
	public String getWorkEmailAddress() {
		return workEmailAddress;
	}
	public void setWorkEmailAddress(String workEmailAddress) {
		this.workEmailAddress = workEmailAddress;
	}
	@JsonView(JsonViews.User.class)
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	@JsonView(JsonViews.User.class)
	public String getRace() {
		return race;
	}
	public void setRace(String race) {
		this.race = race;
	}
	@JsonView(JsonViews.User.class)
	public Date getBirthdate() {
		return birthdate;
	}
	public void setBirthdate(Date birthdate) {
		this.birthdate = birthdate;
	}
	@JsonView(JsonViews.User.class)
	public String getReligion() {
		return religion;
	}
	public void setReligion(String religion) {
		this.religion = religion;
	}
	@JsonView(JsonViews.User.class)
	public String getPassionforReligion() {
		return passionforReligion;
	}
	public void setPassionforReligion(String passionforReligion) {
		this.passionforReligion = passionforReligion;
	}
	@JsonView(JsonViews.User.class)
	public String getPoliticalParty() {
		return politicalParty;
	}
	public void setPoliticalParty(String politicalParty) {
		this.politicalParty = politicalParty;
	}
	@JsonView(JsonViews.User.class)
	public String getNickName() {
		return nickName;
	}
	



}
