module.exports  = {
  test: "SELECT USER_ID AS userId" +
			  ", USER_NAME AS userName" +
			  ", USER_EMAIL AS userEmail" +
  			  ", LANGUAGE AS lang" +
			  "    FROM USER_INFO", +
			  "    WHERE SEQ=?", +
  test2: "SELECT NAME AS F.foodName" +
			  ", PRICE AS F>foodPrice" +
			  ", USER_EMAIL AS I.userEmail" +
   			  ", LANGUAGE AS I.lang" +
			  "    FROM FOOD_INFO F" +
			  "	   JOIN USER_INFO I ON F.BUYER_SEQ=I.USER_EMAIL"
}

