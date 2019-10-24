import os
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By


class CreatePatientAccountButtonTests(unittest.TestCase):
	
	def setUp(self):
		dire = os.path.dirname(os.path.abspath(__file__))
		chrome_driver_path = dire + "/chromedriver"
		self.driver = webdriver.Chrome(chrome_driver_path)

	def test_search(self):
		
		driver = self.driver
		driver.get("http://localhost:3000")
		signup_button = driver.find_element_by_id("clicksignup")
		signup_button.click()
		patient_button = driver.find_element_by_id("patient_button")
		patient_button.click()
		assert "Patient Register" in driver.page_source
		

	def tearDown(self):
		self.driver.close()

if __name__ == '__main__':
	unittest.main()