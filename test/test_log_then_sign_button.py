import os
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By


class LogThenSignButtonTests(unittest.TestCase):
	
	def setUp(self):
		dire = os.path.dirname(os.path.abspath(__file__))
		chrome_driver_path = dire + "/chromedriver"
		self.driver = webdriver.Chrome(chrome_driver_path)

	def test_search(self):
		
		driver = self.driver
		driver.get("http://localhost:3000")
		login_button = driver.find_element_by_id("clicklog")
		login_button.click()
		url = "\signup"
		log_then_sign_button = driver.find_element_by_xpath('//a[@href="'+url+'"]')
		log_then_sign_button.click()
		assert "SignUp" in driver.title

	def tearDown(self):
		self.driver.close()

if __name__ == '__main__':
	unittest.main()