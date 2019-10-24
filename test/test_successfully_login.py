import os
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select


class SuccessfullyLogInTests(unittest.TestCase):
	
	def setUp(self):
		dire = os.path.dirname(os.path.abspath(__file__))
		chrome_driver_path = dire + "/chromedriver"
		self.driver = webdriver.Chrome(chrome_driver_path)

	def test_search(self):
		
		driver = self.driver
		driver.get("http://localhost:3000")
		login_button = driver.find_element_by_id("clicklog")
		login_button.click()
		select_type = Select(driver.find_element_by_name('usertype'))
		select_type.select_by_visible_text("Doctor")
		input_email_box = driver.find_element_by_name("Email")
		input_email_box.clear()
		input_email_box.send_keys("tb716@doc.com")
		input_password_box = driver.find_element_by_name("Password")
		input_password_box.clear()
		input_password_box.send_keys("3513032294")
		confirm_button = log_then_sign_button = driver.find_element_by_xpath('//button[@type="submit"]')
		confirm_button.click()
		
		assert "<title>iCure</title>" in driver.page_source
	

	def tearDown(self):
		self.driver.close()

if __name__ == '__main__':
	unittest.main()